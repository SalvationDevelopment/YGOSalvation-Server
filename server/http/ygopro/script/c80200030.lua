--剣闘獣アウグストル
function c80200030.initial_effect(c)
	--Hand special summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80200030,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetCondition(c80200030.spgcon)
	e1:SetTarget(c80200030.spgtg)
	e1:SetOperation(c80200030.spgop)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80200030,1))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_PHASE+PHASE_BATTLE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCondition(c80200030.spcon)
	e2:SetCost(c80200030.spcost)
	e2:SetTarget(c80200030.sptg)
	e2:SetOperation(c80200030.spop)
	c:RegisterEffect(e2)
end
function c80200030.spgcon(e,tp,eg,ep,ev,re,r,rp)
	local st=e:GetHandler():GetSummonType()
	return st>=(SUMMON_TYPE_SPECIAL+100) and st<(SUMMON_TYPE_SPECIAL+150)
end
function c80200030.spgfilter(c,e,tp)
	return c:IsSetCard(0x19) and c:IsCanBeSpecialSummoned(e,125,tp,false,false)
end
function c80200030.spgtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80200030.spgfilter,tp,LOCATION_HAND,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,0)
end
function c80200030.spgop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local tc=Duel.SelectMatchingCard(tp,c80200030.spgfilter,tp,LOCATION_HAND,0,1,1,nil,e,tp):GetFirst()
	if tc and Duel.SpecialSummon(tc,125,tp,tp,false,false,POS_FACEUP_DEFENCE)>0 then
		tc:RegisterFlagEffect(80200031,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
		tc:RegisterFlagEffect(tc:GetOriginalCode(),RESET_EVENT+0x1ff0000,0,0)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetCode(EVENT_PHASE+PHASE_END)
		e1:SetReset(RESET_PHASE+PHASE_END)
		e1:SetCountLimit(1)
		e1:SetOperation(c80200030.retop)
		Duel.RegisterEffect(e1,tp)
	end
end
function c80200030.retfilter(c)
	return c:GetFlagEffect(80200031)>0
end
function c80200030.retop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c80200030.retfilter,tp,LOCATION_MZONE,0,nil)
	Duel.SendtoDeck(g,nil,2,REASON_EFFECT)
end
function c80200030.spcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetBattledGroupCount()>0
end
function c80200030.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsAbleToDeckAsCost() end
	Duel.SendtoDeck(c,nil,2,REASON_COST)
end
function c80200030.filter(c,e,tp)
	return not c:IsCode(80200030) and c:IsSetCard(0x19) and c:IsCanBeSpecialSummoned(e,125,tp,false,false)
end
function c80200030.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
		and Duel.IsExistingMatchingCard(c80200030.filter,tp,LOCATION_DECK,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_DECK)
end
function c80200030.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80200030.filter,tp,LOCATION_DECK,0,1,1,nil,e,tp)
	local tc=g:GetFirst()
	if tc then
		Duel.SpecialSummon(tc,125,tp,tp,false,false,POS_FACEUP)		
		tc:RegisterFlagEffect(tc:GetOriginalCode(),RESET_EVENT+0x1ff0000,0,0)
	end
end