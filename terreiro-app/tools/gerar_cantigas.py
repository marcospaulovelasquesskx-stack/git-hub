"""Gera cantigas.js a partir da coletânea "Cantigas de Angola" (.docx).

Uso: python3 tools/gerar_cantigas.py caminho/da/coletanea.docx

Cada cantiga é um bloco de parágrafos seguidos (uma linha em branco separa uma
cantiga da outra). Os trechos em negrito no documento são as cantigas que a
casa reconheceu como cantadas no dia a dia; elas aparecem primeiro no app.
"""
import json
import re
import sys

import docx

SECOES = {
    "ESU": "aluvaia", "PEMBA": "pemba", "NKOSI": "nkosi", "NGUNSU": "mutalambo",
    "KATENDE": "katende", "KAVUNGU": "kavungo", "ZAZI": "nzazi", "KAIANGU": "matamba",
    "DANDA": "dandalunda", "TELEKOMPENSU": "telekompensu", "HANGOL": "angoro",
    "VUNJI": "vunji", "KAIALA": "kaitumba", "LUGANO": "lugano", "AGANJI": "aganji",
    "KITEMBU": "kitembo", "ZUMBARANDA": "zumbaranda", "LEMBA": "lemba",
}
# Linhas de preparo ritual, que ficam fora do app.
IGNORAR = ("ACENDER A TUIA", "ACUCAR PARA TRAZER", "CARVAO PARA MANDAR")
# Pequenas correções de digitação e de anotações no meio da letra.
CORRECOES = {
    "PAõ": "PAÕ", "(Serve para LOGUM)": "(Serve também para Logum)",
    "(Mãe Pondá)": "(MÃE PONDÁ)", "(Pai Ibolama))": "(PAI IBOLAMA)",
    "barrcão": "barracão", "fose": "fosse", "Oxum ) Chama": "Oxum. Chama",
}
MARCA_OK = re.compile(r"^\(?(bis|BIS|r|R|resp|RESP|rep|REP)[.:)]*\)?$|^\(\^\)$")


def tem_minuscula(palavra):
    sem_acento = re.sub(r"\([^)]*\)", "", palavra)  # PEMBA(ê) marca a pronúncia, não é observação
    return any(c.islower() for c in sem_acento) and not MARCA_OK.match(palavra)


def separar(linha):
    """Separa a observação (em letras minúsculas) da letra da cantiga (em maiúsculas)."""
    palavras = linha.split()
    corte = 0
    for i, p in enumerate(palavras):
        if tem_minuscula(p):
            corte = i + 1
    if corte == 0:
        return "", linha
    # observação no começo e letra em maiúsculas depois
    nota, letra = " ".join(palavras[:corte]), " ".join(palavras[corte:])
    return nota.strip(" .,()"), letra.strip(" ,)")


def secao(texto):
    for chave, id_ in SECOES.items():
        if chave in texto.upper():
            return id_
    return None


def main(caminho):
    doc = docx.Document(caminho)
    cantigas, atual, bloco, ultimo = {}, None, None, -2

    def fechar():
        if atual and bloco and bloco["letra"]:
            bloco["letra"] = "\n".join(bloco["letra"])
            bloco["nota"] = "; ".join(bloco["nota"])
            cantigas.setdefault(atual, []).append(bloco)

    for i, p in enumerate(doc.paragraphs):
        texto = p.text.strip()
        for errado, certo in CORRECOES.items():
            texto = texto.replace(errado, certo)
        if not texto or texto == ".":
            continue
        if p.style.name.startswith(("Heading", "Title")) and secao(texto):
            fechar()
            atual, bloco, ultimo = secao(texto), None, i
            continue
        if any(texto.upper().startswith(x) for x in IGNORAR) or texto.upper() == "FOGO":
            continue
        corridos = [r for r in p.runs if r.text.strip()]
        negrito = sum(len(r.text) for r in corridos if r.bold) > 0.6 * max(1, sum(len(r.text) for r in corridos))
        # uma linha em branco, ou a passagem entre negrito e texto normal, começa outra cantiga
        if bloco is None or i - ultimo > 1 or (bloco["letra"] and negrito != bloco["casa"]):
            fechar()
            bloco = {"letra": [], "nota": [], "casa": False}
        ultimo = i
        nota, letra = separar(texto)
        if nota:
            bloco["nota"].append(nota.replace(" )", ")").strip("() "))
        if re.search(r"\w", letra):
            bloco["letra"].append(letra)
        bloco["casa"] = bloco["casa"] or negrito
    fechar()

    for id_ in cantigas:
        cantigas[id_].sort(key=lambda c: not c["casa"])
        for c in cantigas[id_]:
            if not c["nota"]:
                del c["nota"]
    total = sum(len(v) for v in cantigas.values())
    casa = sum(c["casa"] for v in cantigas.values() for c in v)
    with open("cantigas.js", "w", encoding="utf-8") as f:
        f.write("/* Gerado por tools/gerar_cantigas.py a partir da coletânea \"Cantigas de Angola: "
                "Coletânea de Cânticos Litúrgicos dos Inquices\".\n   \"casa\": true marca as cantigas "
                "reconhecidas como cantadas na nossa casa (em negrito no documento). */\n")
        f.write("window.CANTIGAS = ")
        json.dump(cantigas, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    print(f"{total} cantigas, {casa} da casa, {len(cantigas)} seções")


if __name__ == "__main__":
    main(sys.argv[1])
