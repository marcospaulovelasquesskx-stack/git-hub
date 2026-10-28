import csv,collections,os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dados','tse-2024','')
HC='DT_GERACAO;HH_GERACAO;ANO_ELEICAO;CD_TIPO_ELEICAO;NM_TIPO_ELEICAO;NR_TURNO;CD_ELEICAO;DS_ELEICAO;DT_ELEICAO;TP_ABRANGENCIA;SG_UF;SG_UE;NM_UE;CD_MUNICIPIO;NM_MUNICIPIO;NR_ZONA;CD_CARGO;DS_CARGO;SQ_CANDIDATO;NR_CANDIDATO;NM_CANDIDATO;NM_URNA_CANDIDATO;NM_SOCIAL_CANDIDATO;CD_SITUACAO_CANDIDATURA;DS_SITUACAO_CANDIDATURA;CD_DETALHE_SITUACAO_CAND;DS_DETALHE_SITUACAO_CAND;CD_SITUACAO_JULGAMENTO;DS_SITUACAO_JULGAMENTO;CD_SITUACAO_CASSACAO;DS_SITUACAO_CASSACAO;CD_SITUACAO_DCONST_DIPLOMA;DS_SITUACAO_DCONST_DIPLOMA;TP_AGREMIACAO;NR_PARTIDO;SG_PARTIDO;NM_PARTIDO;NR_FEDERACAO;NM_FEDERACAO;SG_FEDERACAO;DS_COMPOSICAO_FEDERACAO;SQ_COLIGACAO;NM_COLIGACAO;DS_COMPOSICAO_COLIGACAO;ST_VOTO_EM_TRANSITO;QT_VOTOS_NOMINAIS;NM_TIPO_DESTINACAO_VOTOS;QT_VOTOS_NOMINAIS_VALIDOS;CD_SIT_TOT_TURNO;DS_SIT_TOT_TURNO'.split(';')
HS='DT_GERACAO;HH_GERACAO;ANO_ELEICAO;CD_TIPO_ELEICAO;NM_TIPO_ELEICAO;NR_TURNO;CD_ELEICAO;DS_ELEICAO;DT_ELEICAO;TP_ABRANGENCIA;SG_UF;SG_UE;NM_UE;CD_MUNICIPIO;NM_MUNICIPIO;NR_ZONA;NR_SECAO;CD_CARGO;DS_CARGO;NR_VOTAVEL;NM_VOTAVEL;QT_VOTOS;NR_LOCAL_VOTACAO;SQ_CANDIDATO;NM_LOCAL_VOTACAO;DS_LOCAL_VOTACAO_ENDERECO'.split(';')
cand={}
for r in csv.reader(open(D+'votacao_candidato_vera_cruz.csv',encoding='utf-8'),delimiter=';'):
  d=dict(zip(HC,r))
  if d['DS_CARGO']!='Vereador': continue
  k=d['NR_CANDIDATO']
  c=cand.setdefault(k,dict(nome=d['NM_URNA_CANDIDATO'],partido=d['SG_PARTIDO'],sit=d['DS_SIT_TOT_TURNO'],votos=0))
  c['votos']+=int(d['QT_VOTOS_NOMINAIS'])
# locais -> bairro
bairro={}
HL='DT_GERACAO;HH_GERACAO;AA_ELEICAO;DT_ELEICAO;DS_ELEICAO;NR_TURNO;SG_UF;CD_MUNICIPIO;NM_MUNICIPIO;NR_ZONA;NR_SECAO;CD_TIPO_SECAO_AGREGADA;DS_TIPO_SECAO_AGREGADA;NR_SECAO_PRINCIPAL;NR_LOCAL_VOTACAO;NM_LOCAL_VOTACAO;CD_TIPO_LOCAL;DS_TIPO_LOCAL;DS_ENDERECO;NM_BAIRRO'.split(';')
for r in csv.reader(open(D+'locais_votacao_vera_cruz.csv',encoding='utf-8'),delimiter=';'):
  d=dict(zip(HL,r)); bairro[d['NR_LOCAL_VOTACAO']]=d['NM_BAIRRO'].replace('DISTRITO DE ','').title()
JIRI={'1147','1139','1414'}
porloc=collections.defaultdict(lambda: collections.Counter())  # cand -> bairro votes
jiri=collections.Counter(); jiri_leg=collections.Counter(); jiri_brancos=0
tot_bairro=collections.Counter()
for r in csv.reader(open(D+'votacao_secao_vera_cruz.csv',encoding='utf-8'),delimiter=';'):
  d=dict(zip(HS,r))
  if d['DS_CARGO']!='Vereador': continue
  n=d['NR_VOTAVEL']; v=int(d['QT_VOTOS']); b=bairro.get(d['NR_LOCAL_VOTACAO'],'?')
  if n in cand:
    porloc[n][b]+=v; tot_bairro[b]+=v
    if d['NR_LOCAL_VOTACAO'] in JIRI: jiri[n]+=v
  elif d['NR_LOCAL_VOTACAO'] in JIRI: jiri_leg[d['NM_VOTAVEL']]+=v
base={n:porloc[n].most_common(1)[0][0] if porloc[n] else '?' for n in cand}
eleitos=[n for n,c in cand.items() if c['sit'].startswith('ELEITO')]
print('=== ELEITOS (%d)'%len(eleitos))
for n in sorted(eleitos,key=lambda n:-cand[n]['votos']):
  c=cand[n]; print(f"{c['nome']:<32} {c['partido']:<14} {c['votos']:>5} votos | base: {base[n]:<16} | em Jiribatuba: {jiri[n]}  ({c['sit']})")
T=sum(jiri.values())
print('\n=== VOTOS NOMINAIS P/ VEREADOR NAS SECOES DE JIRIBATUBA:',T, '| outros (legenda/branco/nulo):',dict(jiri_leg))
loc=sum(v for n,v in jiri.items() if base[n]=='Jiribatuba')
print('para candidatos com base em Jiribatuba:',loc, f'({100*loc/T:.1f}%)')
print('para candidatos com base em outro lugar:',T-loc, f'({100*(T-loc)/T:.1f}%)')
print('\nTop 15 em Jiribatuba:')
for n,v in jiri.most_common(15):
  c=cand[n]; print(f"  {v:>4} {c['nome']:<30} {c['partido']:<14} base: {base[n]:<14} total: {c['votos']:>4} {c['sit']}")
print('\nCandidatos com base em Jiribatuba:')
for n in cand:
  if base[n]=='Jiribatuba': c=cand[n]; print(f"  {c['nome']:<30} {c['partido']:<14} total {c['votos']:>4} | em Jiri {jiri[n]:>4} | {c['sit']}")
# partido totals
pt=collections.Counter()
for n,c in cand.items(): pt[c['partido']]+=c['votos']
print('\nVotos nominais por partido:',pt.most_common())
print('Total vereador nominais municipio:',sum(c['votos'] for c in cand.values()), '| n candidatos', len(cand))
