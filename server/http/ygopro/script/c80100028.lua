--炎竜星－シュンゲイ
function c80100028.initial_effect(c)
	--Special Summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80100028,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_CHAIN_UNIQUE)
	e1:SetCode(EVENT_TO_GRAVE)
	e1:SetCondition(c80100028.spcon)
	e1:SetCost(c80100028.spcost)
	e1:SetTarget(c80100028.sptg)
	e1:SetOperation(c80100028.spop)
	c:RegisterEffect(e1)
	--synchro effect
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100028,1))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetHintTiming(0,0x1c0+TIMING_MAIN_END+TIMING_BATTLE_START)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c80100028.sccon)
	e2:SetTarget(c80100028.sctarg)
	e2:SetOperation(c80100028.scop)
	c:RegisterEffect(e2)
	--be material
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100028,2))
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e3:SetCode(EVENT_BE_MATERIAL)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e3:SetCondition(c80100028.ccon)
	e3:SetOperation(c80100028.cop)
	c:RegisterEffect(e3)
end
function c80100028.spcon(e,tp,eg,ep,ev,re,r,rp)
	return bit.band(r,REASON_DESTROY)~=0 and e:GetHandler():GetPreviousControler()==tp
		and e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end
function c80100028.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80100028)==0 end
	Duel.RegisterFlagEffect(tp,80100028,RESET_PHASE+PHASE_END,0,1)
end
function c80100028.filter(c,e,tp)
	return c:IsSetCard(0x9c) and c:GetCode()~=80100028 and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100028.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80100028.filter,tp,LOCATION_DECK,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_DECK)
end
function c80100028.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80100028.filter,tp,LOCATION_DECK,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
end
function c80100028.sccon(e,tp,eg,ep,ev,re,r,rp)
	return not e:GetHandler():IsStatus(STATUS_CHAINING) and Duel.GetTurnPlayer()~=tp
		and (bit.band(Duel.GetCurrentPhase(),PHASE_MAIN1+PHASE_MAIN2+PHASE_BATTLE)~=0)
end
function c80100028.sctarg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then 
		local mg=Duel.GetMatchingGroup(Card.IsSetCard,tp,LOCATION_MZONE,0,0x9c)
		return Duel.IsExistingMatchingCard(Card.IsSynchroSummonable,tp,LOCATION_EXTRA,0,1,nil,mg) 
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c80100028.scop(e,tp,eg,ep,ev,re,r,rp)
	local mg=Duel.GetMatchingGroup(Card.IsSetCard,tp,LOCATION_MZONE,0,0x9c)
	local g=Duel.GetMatchingGroup(Card.IsSynchroSummonable,tp,LOCATION_EXTRA,0,nil,mg)
	if g:GetCount()>0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local sg=g:Select(tp,1,1,nil)
		Duel.SynchroSummon(tp,sg:GetFirst(),c)
	end
end
function c80100028.ccon(e,tp,eg,ep,ev,re,r,rp)
	return r==REASON_SYNCHRO
end
function c80100028.cop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local sync=c:GetReasonCard()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetValue(500)
	e1:SetReset(RESET_EVENT+0x1fe0000)
	sync:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EFFECT_UPDATE_DEFENCE)
	sync:RegisterEffect(e2)
end