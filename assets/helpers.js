const fmt=n=>n.toLocaleString("ko-KR");
const uid=()=>Math.random().toString(36).slice(2,8);
const AC="#1a1a1a",GD="#8B6F2F",BL="#2563EB";
const F="'Pretendard Variable','Pretendard',-apple-system,'Noto Sans KR',sans-serif";

/* ── 세금/세율 단일 정의 (법령·정책 변경 시 여기만 수정) ── */
const TAX_CONFIG={
  vat:0.1,                    /* 부가세 10% (공급가액 = 가격 / (1+vat)) */
  indCon:0.035,               /* 개별소비세 3.5% */
  edu:0.3,                    /* 교육세 = 개별소비세의 30% */
  TX:{                        /* 취득세율 (차종별) */
    sedan7:{l:"승용(9인승 이하)",r:0.07},
    van5:{l:"승합(7인이상)",r:0.05},
    cargo5:{l:"화물차",r:0.05},
    kcar:{l:"경차(1600cc미만)",r:0.04}
  },
  BOND:{                      /* 공채 매입율 (지역별) */
    seoul:{l:"서울",b:0.058},
    gyeonggi:{l:"경기/인천",b:0.04},
    other:{l:"기타 지역",b:0.02},
    freight:{l:"기타 지역 (화물)",b:0.01}
  },
  SEAT:{s6:{l:"6인 이하"},s7:{l:"7인 이상"}},
  EXEMPT:{none:{l:"일반"},c2:{l:"2자녀(다자녀)"},c3:{l:"3자녀 이상"},disabled:{l:"장애인·국가유공자"}}
};
const indConPct=(TAX_CONFIG.indCon*100).toFixed(1).replace(/\.0$/,"");
const eduPct=(TAX_CONFIG.edu*100).toFixed(0);

function FL(){return null;}

function ld(){return new Promise(function(resolve){if(!window.db){resolve(null);return;}window.db.collection("config").doc("vehicleData").get().then(function(doc){if(doc.exists){var d=doc.data();resolve({data:d.data,updatedAt:d.updatedAt||null});}else{resolve(null);}}).catch(function(e){console.error("[ld vehicleData]",e);resolve(null);});});}
/* Firebase 데이터에 PV5 + 카니발 색상이 없으면 자동 주입 */
function ensurePV5Colors(data){
  if(!data||!data.vehicles)return data;
  var pv5=data.vehicles.find(function(v){return v.id==="pv5";});
  if(pv5){
    if(!pv5.colors||!pv5.colors.passenger){
      pv5.colors=pv5.colors||{};
      pv5.colors.passenger=[
        {id:"pv5p_cw",name:"클리어화이트",hex:"#F3F3F3",price:0},
        {id:"pv5p_sg",name:"스틸 그레이",hex:"#7B7A7F",price:0},
        {id:"pv5p_ab",name:"오로라블랙펄",hex:"#161513",price:0},
        {id:"pv5p_fb",name:"포레스트 블루",hex:"#607381",price:0},
        {id:"pv5p_cg",name:"시티케이프 그린",hex:"#404F4C",price:0},
        {id:"pv5p_sm",name:"소프트 민트",hex:"#757D7F",price:0},
        {id:"pv5p_lg",name:"레이크하우스그레이",hex:"#242B31",price:0},
      ];
    }
    if(!pv5.colors.cargo){
      pv5.colors.cargo=[
        {id:"pv5c_cw",name:"클리어화이트",hex:"#F3F3F3",price:0},
        {id:"pv5c_sg",name:"스틸 그레이",hex:"#7B7A7F",price:0},
        {id:"pv5c_ab",name:"오로라블랙펄",hex:"#161513",price:0},
      ];
    }
    if(!pv5.interiorColors){pv5.interiorColors={};}
    if(!pv5.interiorColors.pass_basic){
      pv5.interiorColors.pass_basic=[
        {id:"pv5i_nv1",name:"네이비",hex:"#24282D",price:0},
        {id:"pv5i_ng1",name:"네이비그레이",hex:"#24282D",hex2:"#7B7A7F",price:0},
        {id:"pv5i_br1",name:"브라운",hex:"#4E4741",price:0},
      ];
    }
    if(!pv5.interiorColors.pass_plus){
      pv5.interiorColors.pass_plus=[
        {id:"pv5i_nv2",name:"네이비",hex:"#24282D",price:0},
        {id:"pv5i_ng2",name:"네이비그레이",hex:"#24282D",hex2:"#7B7A7F",price:0},
        {id:"pv5i_br2",name:"브라운",hex:"#4E4741",price:0},
      ];
    }
    /* 카고 내장색상은 네이비 단일 (시트색상이 별도) */
    var cargoStdNeedsReset=pv5.interiorColors&&pv5.interiorColors.cargo_std&&pv5.interiorColors.cargo_std[0]&&pv5.interiorColors.cargo_std[0].id!=="pv5i_nv_c1";
    if(!pv5.interiorColors.cargo_std||cargoStdNeedsReset){
      pv5.interiorColors.cargo_std=[
        {id:"pv5i_nv_c1",name:"네이비",hex:"#24282D",price:0},
      ];
    }
    var cargoLrNeedsReset=pv5.interiorColors&&pv5.interiorColors.cargo_lr&&pv5.interiorColors.cargo_lr[0]&&pv5.interiorColors.cargo_lr[0].id!=="pv5i_nv_c2";
    if(!pv5.interiorColors.cargo_lr||cargoLrNeedsReset){
      pv5.interiorColors.cargo_lr=[
        {id:"pv5i_nv_c2",name:"네이비",hex:"#24282D",price:0},
      ];
    }
    /* 시트 색상 주입 */
    if(!pv5.seatColors){pv5.seatColors={};}
    if(!pv5.seatColors.pass_basic){
      pv5.seatColors.pass_basic=[
        {id:"pv5s_dn1",name:"딥네이비",hex:"#141B2E",price:0},
        {id:"pv5s_nbp1",name:"네이비&베이지 포인트",hex:"#1A2240",hex2:"#C0BAB7",price:0},
        {id:"pv5s_br1",name:"브라운",hex:"#4E4741",price:0},
      ];
    }
    if(!pv5.seatColors.pass_plus){
      pv5.seatColors.pass_plus=[
        {id:"pv5s_dn2",name:"딥네이비",hex:"#141B2E",price:0},
        {id:"pv5s_nbp2",name:"네이비&베이지 포인트",hex:"#1A2240",hex2:"#C0BAB7",price:0},
        {id:"pv5s_br2",name:"브라운",hex:"#4E4741",price:0},
      ];
    }
    if(!pv5.seatColors.cargo_std){
      pv5.seatColors.cargo_std=[
        {id:"pv5s_dn_c1",name:"딥네이비",hex:"#141B2E",price:0},
        {id:"pv5s_nbp_c1",name:"네이비&베이지 포인트",hex:"#1A2240",hex2:"#C0BAB7",price:0},
      ];
    }
    if(!pv5.seatColors.cargo_lr){
      pv5.seatColors.cargo_lr=[
        {id:"pv5s_dn_c2",name:"딥네이비",hex:"#141B2E",price:0},
        {id:"pv5s_nbp_c2",name:"네이비&베이지 포인트",hex:"#1A2240",hex2:"#C0BAB7",price:0},
      ];
    }
  }
  /* 카니발(carnival) 색상 주입 */
  var carnival=data.vehicles.find(function(v){return v.id==="carnival";});
  if(carnival){
    var hasHex1=carnival.colors&&carnival.colors.default&&carnival.colors.default[0]&&carnival.colors.default[0].hex;
    if(!hasHex1){
      carnival.colors={
        default:[
          {id:"cl1",name:"스노우화이트펄",hex:"#F2F2F2",price:80000},
          {id:"cl3",name:"아이보리실버",hex:"#C4C4C4",price:0},
          {id:"cl6",name:"오로라블랙펄",hex:"#353535",price:0},
          {id:"cl4",name:"판테라메탈",hex:"#535356",price:0},
        ],
        xline:[
          {id:"cl1",name:"스노우화이트펄",hex:"#F2F2F2",price:0},
          {id:"cl2",name:"블랙펄",hex:"#1A1A1A",price:0},
          {id:"cl5",name:"세라믹실버",hex:"#B0B4B8",price:0},
        ],
      };
      carnival.interiorColors={
        prestige:[{id:"ic1",name:"토프",hex:"#807B7D",price:0}],
        noblesse:[{id:"ic1",name:"토프",hex:"#807B7D",price:0},{id:"ic2",name:"코튼베이지",hex:"#C0BAB7",price:0}],
        signature:[{id:"ic1",name:"토프",hex:"#807B7D",price:0},{id:"ic2",name:"코튼베이지",hex:"#C0BAB7",price:0}],
        xline:[{id:"ic1",name:"토프",hex:"#807B7D",price:0},{id:"ic2",name:"코튼베이지",hex:"#C0BAB7",price:0},{id:"ic4",name:"네이비베이지",hex:"#1A2240",hex2:"#C0BAB7",price:0}],
      };
    }
  }
  /* 챌린저(challenger) 색상 주입 */
  var ch=data.vehicles.find(function(v){return v.id==="challenger";});
  if(ch){
    var hasHex=ch.colors&&ch.colors.default&&ch.colors.default[0]&&ch.colors.default[0].hex;
    if(!hasHex){
      ch.colors={
        default:[
          {id:"cl1",name:"스노우화이트펄",hex:"#F2F2F2",price:80000},
          {id:"cl3",name:"아이보리실버",hex:"#C4C4C4",price:0},
          {id:"cl6",name:"오로라블랙펄",hex:"#353535",price:0},
          {id:"cl4",name:"판테라메탈",hex:"#535356",price:0},
        ],
        ch_xline:[
          {id:"cl1",name:"스노우화이트펄",hex:"#F2F2F2",price:0},
          {id:"cl2",name:"블랙펄",hex:"#1A1A1A",price:0},
          {id:"cl5",name:"세라믹실버",hex:"#B0B4B8",price:0},
        ],
      };
      ch.interiorColors={
        ch_prestige:[{id:"ic1",name:"토프",hex:"#807B7D",price:0}],
        ch_noblesse:[{id:"ic1",name:"토프",hex:"#807B7D",price:0},{id:"ic2",name:"코튼베이지",hex:"#C0BAB7",price:0}],
        ch_signature:[{id:"ic1",name:"토프",hex:"#807B7D",price:0},{id:"ic2",name:"코튼베이지",hex:"#C0BAB7",price:0}],
        ch_xline:[{id:"ic1",name:"토프",hex:"#807B7D",price:0},{id:"ic2",name:"코튼베이지",hex:"#C0BAB7",price:0},{id:"ic4",name:"네이비베이지",hex:"#1A2240",hex2:"#C0BAB7",price:0}],
      };
    }
  }
  return data;
}
/* 낙관적 락: 서버의 updatedAt이 lastSeenUpdatedAt과 일치할 때만 저장. 동시 편집 충돌 방지. */
function sv(d,lastSeenUpdatedAt){return new Promise(function(resolve){
  if(!window.db){resolve({ok:false,reason:"no-db"});return;}
  var ref=window.db.collection("config").doc("vehicleData");
  var newUpdatedAt=new Date().toISOString();
  window.db.runTransaction(function(tx){
    return tx.get(ref).then(function(snap){
      var serverUpdatedAt=snap.exists?(snap.data().updatedAt||null):null;
      if(serverUpdatedAt && serverUpdatedAt!==lastSeenUpdatedAt){
        var err=new Error("CONFLICT");err.serverUpdatedAt=serverUpdatedAt;throw err;
      }
      tx.set(ref,{data:d,updatedAt:newUpdatedAt});
      return newUpdatedAt;
    });
  }).then(function(updatedAt){resolve({ok:true,updatedAt:updatedAt});})
  .catch(function(e){
    if(e.message==="CONFLICT"){console.warn("[sv vehicleData] 동시 편집 충돌:",e.serverUpdatedAt);}
    else{console.error("[sv vehicleData]",e);}
    resolve({ok:false,reason:e.message==="CONFLICT"?"conflict":"error",error:e});
  });
});}
