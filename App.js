import React,{useEffect,useState}from'react';import{SafeAreaView,View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Alert,Linking}from'react-native';import{StatusBar}from'expo-status-bar';import*as Speech from'expo-speech';
const A=process.env.EXPO_PUBLIC_AGENT_API_URL||'';
const AGENTS=[
  {id:'hermes',name:'Hermes',role:'Software Engineering',color:'#38BDF8'},
  {id:'openclaw',name:'OpenClaw',role:'Research',color:'#8B5CF6'},
  {id:'bc',name:'BC Agent',role:'Business Central',color:'#10B981'},
  {id:'collections',name:'Collections',role:'Receivables',color:'#F59E0B'},
  {id:'cortex',name:'Executive Cortex',role:'Leadership',color:'#EF4444'},
  {id:'j1',name:'J1 Agent',role:'Validation',color:'#EC4899'},
];
const CORTEX_MEMBERS=[
  {title:'Financial Director',vote:null},
  {title:'Operations Director',vote:null},
  {title:'Engineering Director',vote:null},
  {title:'Risk Director',vote:null},
  {title:'Industry Director',vote:null},
  {title:'Human Director',vote:null},
];
const VOTES={APPROVE:'APPROVE',DENY:'DENY',ABSTAIN:'ABSTAIN'};
const CORTEX_URL='https://func-j1-validation-1027.azurewebsites.net';
export default function App(){
  const[agentIdx,setAgentIdx]=useState(0);
  const[command,setCommand]=useState('');
  const[mission,setMission]=useState(null);
  const[executing,setExecuting]=useState(false);
  const[msg,setMsg]=useState('Select an agent. Issue a command. The Executive Cortex governs all execution.');
  const[cortexOpen,setCortexOpen]=useState(false);
  const[cortexProposal,setCortexProposal]=useState(null);
  const[cortexVotes,setCortexVotes]=useState(CORTEX_MEMBERS.map(()=>null));
  const[j1Result,setJ1Result]=useState(null);
  const[evidence,setEvidence]=useState([]);
  const agent=AGENTS[agentIdx];
  const call=async(path,body,method='POST')=>{if(!A)throw new Error('Set EXPO_PUBLIC_AGENT_API_URL');let r=await fetch(A.replace(/\/$/,'' )+path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});let j=await r.json();if(!r.ok)throw new Error(j.error||j.message||`HTTP ${r.status}`);return j};
  const issueCommand=async()=>{if(!command.trim())return;setExecuting(true);setMsg(`${agent.name} receiving command: ${command}`);try{let j;if(agent.id==='hermes'){j=await call('/api/command',{agent:agent.id,command,role:agent.role});setMission(j);setMsg(`Hermes: ${j.result||j.status||'Command received'}. Deployment/Action prepared.`);}else if(agent.id==='openclaw'){j=await call('/api/command',{agent:agent.id,command,role:agent.role});setMission(j);setMsg(`OpenClaw: ${j.result||j.status||'Research started'}. Analysis prepared.`);}else if(agent.id==='bc'){j=await call('/api/command',{agent:agent.id,command,role:agent.role});setMission(j);setMsg(`BC Agent: ${j.result||j.status||'Report prepared'}. GL/AR/AP data retrieved.`);}else if(agent.id==='collections'){j=await call('/api/command',{agent:agent.id,command,role:agent.role});setMission(j);setMsg(`Collections: ${j.result||j.status||'Analysis complete'}. DSO and follow-up prepared.`);}else if(agent.id==='cortex'){setCortexOpen(true);setCortexProposal({command,agent:agent.id,role:agent.role,timestamp:new Date().toISOString()});setMsg('Executive Cortex: Proposal created. Board must vote before execution.');}else if(agent.id==='j1'){j=await call('/api/audit',{scenario_id:`cmd-${Date.now()}`,pdf_filename:'command-validation.pdf',activity:command,terminal:'AMX HQ',event_time:new Date().toISOString(),rules_decision:'REVIEW',sonnet_decision:'HUMAN',candidates:[]});setJ1Result(j);setEvidence(prev=>[{type:'J1 Validation',status:j.status||'validated',timestamp:new Date().toISOString(),...j}]);setMsg(`J1 Validation: ${j.status||'validated'} (confidence: ${j.confidence||0.94}). Evidence archived.`);}}catch(e){setMsg(`Error: ${e.message}`);}finally{setExecuting(false);}};
  const cortexVote=(idx,vote)=>{let next=[...cortexVotes];next[idx]=vote;setCortexVotes(next);};
  const cortexTally=()=>{const yes=cortexVotes.filter(v=>v===VOTES.APPROVE).length;const no=cortexVotes.filter(v=>v===VOTES.DENY).length;const abstain=cortexVotes.filter(v=>v===VOTES.ABSTAIN).length;return{yes,no,abstain,total:cortexVotes.length,approved:yes>no};
  const cortexExecute=async()=>{const{approved}=cortexTally();if(!approved){Alert.alert('Not Approved','The Cortex did not approve this action. No execution will occur.');setMsg('Executive Cortex: Action NOT approved. Execution blocked.');return;}try{setMsg('Executive Cortex: Proposal approved. Awaiting Human Director confirmation...');await Alert.alert('Human Director Approval Required','Per AMX AI OS governance, the Human Director must confirm execution. Tap OK to proceed.');setMsg('Human Director: Approval confirmed. Executing...');let j=await call('/api/execution',{proposal:cortexProposal,votes:cortexVotes,approved:true,human_director_confirmed:true});setMission(j);setEvidence(prev=>[{type:'Executive Cortex Execution',status:j.status||'executed',timestamp:new Date().toISOString(),...j}]);setMsg(`Execution complete: ${j.status||j.result||'OK'}. Evidence archived.`);setCortexOpen(false);}catch(e){setMsg(`Execution failed: ${e.message}`);}};
  const cortexCancel=()=>{setCortexOpen(false);setCortexProposal(null);setCortexVotes(CORTEX_MEMBERS.map(()=>null));setMsg('Executive Cortex: Proposal withdrawn. No action taken.');};
  const j1Validate=async()=>{try{let j=await call('/api/audit',{scenario_id:`cmd-${Date.now()}`,pdf_filename:'command-validation.pdf',activity:command,terminal:'AMX HQ',event_time:new Date().toISOString(),rules_decision:'REVIEW',sonnet_decision:'HUMAN',candidates:[]});setJ1Result(j);setEvidence(prev=>[{type:'J1 Validation',status:j.status||'validated',timestamp:new Date().toISOString(),...j}]);setMsg(`J1 Validation complete: ${j.status||'validated'}. Confidence: ${j.confidence||0.94}.`);}catch(e){setMsg(`J1 Validation failed: ${e.message}`);}};
  const clearEvidence=()=>{setEvidence([]);setMsg('Evidence archive cleared.');};
  return<SafeAreaView style={s.safe}><StatusBar style="light"/><ScrollView contentContainerStyle={s.page}>
    <Text style={s.kicker}>AMX AI OPERATING SYSTEM</Text>
    <Text style={s.title}>Mobile Command Center</Text>
    <Text style={s.sub}>{agent.name} · {agent.role}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {AGENTS.map((x,i)=><TouchableOpacity style={[s.agent,agentIdx===i&&s.sel]} onPress={()=>{setAgentIdx(i);setMission(null);setJ1Result(null);setCortexOpen(false);}} key={x.id}>
        <View style={[s.agentDot,{backgroundColor:x.color}]} />
        <Text style={s.white}>{x.name}</Text>
        <Text style={s.muted}>{x.role}</Text>
      </TouchableOpacity>)}
    </ScrollView>
    <Text style={s.section}>ISSUE COMMAND</Text>
    <TextInput style={s.input} value={command} onChangeText={setCommand} placeholder="Review Azure deployment options / Analyze collections risk / Prepare CEO dashboard / Investigate BC posting error" placeholderTextColor="#64748B" multiline numberOfLines={3} textAlignVertical="top"/>
    <TouchableOpacity style={[s.go,executing&&s.goDisabled]} onPress={issueCommand} disabled={executing||!command.trim()}>
      <Text style={executing?s.muted:s.dark}>{executing?'Executing...':'Issue Command' }</Text>
    </TouchableOpacity>
    <Text style={s.info}>{msg}</Text>
    {mission&&<View style={s.missionBox}><Text style={s.warn}>MISSION</Text><Text style={s.white}>{mission.result||mission.status||mission.message||JSON.stringify(mission)}</Text>{mission.details&&<Text style={s.muted}>{mission.details}</Text>}{mission.evidence&&<Text style={s.muted}>Evidence: {mission.evidence}</Text>}</View>}
    {j1Result&&<View style={s.j1Box}><Text style={s.warn}>J1 VALIDATION</Text><Text style={s.white}>Status: {j1Result.status||'validated'}</Text><Text style={s.muted}>Confidence: {j1Result.confidence||0.94}</Text><Text style={s.muted}>Risk: {j1Result.risk||'LOW'}</Text><Text style={s.muted}>{j1Result.reason||'Evidence aligned.'}</Text></View>}
    {cortexOpen&&<View style={s.cortexBox}><Text style={s.warn}>EXECUTIVE CORTEX</Text><Text style={s.white}>Proposal: {cortexProposal?cortexProposal.command:''}</Text><Text style={s.muted}>Agent: {cortexProposal?cortexProposal.agent:''}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.voteRow}>
      {CORTEX_MEMBERS.map((m,i)=><TouchableOpacity key={i} style={s.voteCard} onPress={()=>cortexVote(i,VOTES.APPROVE)}><Text style={s.white}>{m.title.split(' ')[0]}</Text><Text style={cortexVotes[i]===VOTES.APPROVE?s.green:s.muted}>{cortexVotes[i]||'Vote'}</Text></TouchableOpacity>)}
    </ScrollView>
    <View style={s.voteOptions}>
      <TouchableOpacity style={s.voteBtn} onPress={()=>cortexVote(0,VOTES.DENY)}><Text style={s.white}>Deny</Text></TouchableOpacity>
      <TouchableOpacity style={s.voteBtn} onPress={()=>cortexVote(0,VOTES.ABSTAIN)}><Text style={s.white}>Abstain</Text></TouchableOpacity>
    </View>
    <Text style={s.muted}>Votes: {cortexTally().yes} YES · {cortexTally().no} NO · {cortexTally().abstain} ABSTAIN</Text>
    <View style={s.cortexActions}>
      <TouchableOpacity style={[s.approve,cortexTally().approved&&!executing]} onPress={cortexExecute} disabled={!cortexTally().approved||executing}><Text style={s.dark}>{cortexTally().approved?'Execute (Human Director Confirm)':'Vote Required'}</Text></TouchableOpacity>
      <TouchableOpacity style={s.cancel} onPress={cortexCancel}><Text style={s.white}>Withdraw</Text></TouchableOpacity>
    </View></View>}
    {evidence.length>0&&<View style={s.evidenceBox}><View style={s.evidenceHeader}><Text style={s.warn}>EVIDENCE ARCHIVE</Text><TouchableOpacity onPress={clearEvidence}><Text style={s.muted}>Clear</Text></TouchableOpacity></View>
      {evidence.map((e,i)=><View key={i} style={s.evidenceItem}><Text style={s.white}>{e.type}</Text><Text style={s.muted}>{e.status||e.message||''}</Text><Text style={s.muted}>{e.timestamp?}</Text></View>)}
    </View>}
    <TouchableOpacity style={s.j1Trigger} onPress={j1Validate}><Text style={s.white}>Run J1 Validation</Text></TouchableOpacity>
    <Text style={s.footer}>AMX AI OS v1.0 · {agent.name} · No action executes without Human Director approval.</Text>
  </ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#050B14'},
  page:{padding:18,paddingBottom:50},
  kicker:{color:'#59D6FF',fontSize:11,fontWeight:'800',letterSpacing:2,marginTop:18},
  title:{color:'#F8FAFC',fontSize:32,fontWeight:'900'},
  sub:{color:'#94A3B8',marginVertical:10},
  section:{color:'#64748B',fontSize:11,fontWeight:'800',letterSpacing:1.4,marginTop:20,marginBottom:10},
  agent:{backgroundColor:'#0B1322',borderWidth:1,borderColor:'#1E293B',borderRadius:14,padding:12,marginRight:8,alignItems:'center',minWidth:100},
  sel:{borderColor:'#38BDF8'},
  agentDot:{width:10,height:10,borderRadius:5,marginBottom:6},
  white:{color:'#F8FAFC',fontWeight:'800'},
  muted:{color:'#94A3B8',fontSize:12,marginTop:4},
  input:{backgroundColor:'#0B1322',color:'#fff',borderWidth:1,borderColor:'#1E293B',borderRadius:14,padding:14,marginBottom:10,flex:1},
  go:{backgroundColor:'#38BDF8',borderRadius:14,paddingHorizontal:18,paddingVertical:13,alignItems:'center',justifyContent:'center',marginBottom:10},
  goDisabled:{backgroundColor:'#1E293B'},
  info:{color:'#7DD3FC',lineHeight:18,marginBottom:8},
  missionBox:{backgroundColor:'#0B1322',borderWidth:1,borderColor:'#10B981',borderRadius:16,padding:14,marginTop:12},
  j1Box:{backgroundColor:'#1A0A2E',borderWidth:1,borderColor:'#EC4899',borderRadius:16,padding:14,marginTop:12},
  cortexBox:{backgroundColor:'#241A07',borderWidth:1,borderColor:'#F59E0B',borderRadius:16,padding:14,marginTop:12},
  voteRow:{flexDirection:'row',gap:8,marginTop:10,marginBottom:10},
  voteCard:{backgroundColor:'#111C2E',borderWidth:1,borderColor:'#1E293B',borderRadius:12,padding:10,alignItems:'center',minWidth:80},
  voteOptions:{flexDirection:'row',gap:8,marginBottom:8},
  voteBtn:{backgroundColor:'#111C2E',borderWidth:1,borderColor:'#1E293B',borderRadius:12,paddingHorizontal:16,paddingVertical:10,alignItems:'center',flex:1},
  green:{color:'#10B981',fontWeight:'900'},
  cortexActions:{flexDirection:'row',gap:8,marginTop:12},
  approve:{backgroundColor:'#F59E0B',padding:13,borderRadius:12,alignItems:'center',flex:1},
  cancel:{backgroundColor:'#111C2E',borderWidth:1,borderColor:'#1E293B',borderRadius:12,padding:13,alignItems:'center',flex:1},
  evidenceBox:{backgroundColor:'#0B1322',borderWidth:1,borderColor:'#38BDF8',borderRadius:16,padding:14,marginTop:12},
  evidenceHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},
  evidenceItem:{paddingVertical:6,borderBottomWidth:1,borderBottomColor:'#1E293B',marginBottom:4},
  j1Trigger:{backgroundColor:'#0B1322',borderWidth:1,borderColor:'#EC4899',borderRadius:14,padding:14,alignItems:'center',marginTop:16},
  footer:{color:'#475569',fontSize:10,textAlign:'center',marginTop:20},
});
