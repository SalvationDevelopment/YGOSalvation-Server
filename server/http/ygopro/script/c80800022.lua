--ゴーストリック・マリー
function c80800022.initial_effect(c)
	--summon limit
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_SUMMON)
	e1:SetCondition(c80800022.sumcon)
	c:RegisterEffect(e1)
	--turn set
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80800022,0))
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c80800022.postg)
	e2:SetOperation(c80800022.posop)
	c:RegisterEffect(e2)
	--Special Summon
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e3:SetRange(LOCATION_HAND)
	e3:SetCode(EVENT_DAMAGE)
	e3:SetCost(c80800022.cost)
	e3:SetCondition(c80800022.spcon)
	e3:SetTarget(c80800022.target)
	e3:SetOperation(c80800022.operation)
	c:RegisterEffect(e3)
end
function c80800022.sfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x8d)
end
function c80800022.sumcon(e)
	return not Duel.IsExistingMatchingCard(c80800022.sfilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil)
end
function c80800022.postg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsCanTurnSet() and c:GetFlagEffect(80800022)==0 end
	c:RegisterFlagEffect(80800022,RESET_EVENT+0x1fc0000+RESET_PHASE+PHASE_END,0,1)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,c,1,0,0)
end
function c80800022.posop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
		Duel.ChangePosition(c,POS_FACEDOWN_DEFENCE)
	end
end
function c80800022.spcon(e,tp,eg,ep,ev,re,r,rp)
	return ep==tp and (bit.band(r,REASON_EFFECT)~=0 or bit.band(r,REASON_BATTLE)>0)
end
function c80800022.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsDiscardable() and Duel.GetFlagEffect(tp,80800022)==0 end
	Duel.SendtoGrave(c,REASON_COST+REASON_DISCARD)
	Duel.RegisterFlagEffect(tp,80800022,RESET_PHASE+PHASE_END,0,1)
end
function c80800022.filter(c,e,tp)
	return c:IsSetCard(0x8d) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80800022.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80800022.filter,tp,LOCATION_DECK,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,LOCATION_DECK)
end
function c80800022.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80800022.filter,tp,LOCATION_DECK,0,1,1,nil,e,tp)
	Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEDOWN_DEFENCE)
end