--Volcanic Mine
function c12347.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c12347.condition)
	e1:SetTarget(c12347.target)
	e1:SetOperation(c12347.activate)
	c:RegisterEffect(e1)
end
function c12347.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x32) and c:IsType(TYPE_MONSTER)
end
function c12347.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c12347.cfilter,tp,LOCATION_ONFIELD,0,1,nil)
end
function c12347.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanSpecialSummonMonster(1-tp,12391,0,0x4011,1000,1000,1,RACE_PYRO,ATTRIBUTE_FIRE) end
	local ft=Duel.GetLocationCount(1-tp,LOCATION_MZONE)
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,ft,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,ft,0,0)
end
function c12347.activate(e,tp,eg,ep,ev,re,r,rp)
	local ft=Duel.GetLocationCount(1-tp,LOCATION_MZONE)
	if ft<=0 or not Duel.IsPlayerCanSpecialSummonMonster(1-tp,12391,0,0x4011,1000,1000,1,RACE_PYRO,ATTRIBUTE_FIRE) then return end
	for i=1,ft do
		local token=Duel.CreateToken(1-tp,12391)
		Duel.SpecialSummonStep(token,0,tp,1-tp,false,false,POS_FACEUP_DEFENCE)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetRange(LOCATION_MZONE)
		e1:SetCode(EVENT_PHASE+PHASE_END)
		e1:SetOperation(c12347.desop)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		e1:SetCountLimit(1)
		token:RegisterEffect(e1,true)	
	end
	Duel.SpecialSummonComplete()
end

function c12347.desop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),REASON_EFFECT)
end