--ガガガタッグ
function c80600059.initial_effect(c)
	--atkboost
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_ATKCHANGE+CATEGORY_TODECK)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c80600059.target)
	e1:SetOperation(c80600059.operation)
	c:RegisterEffect(e1)
end
function c80600059.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80600059)==0 end
	Duel.RegisterFlagEffect(tp,80600059,RESET_PHASE+PHASE_END,EFFECT_FLAG_OATH,1)
end
function c80600059.filter(c)
	return c:IsFaceup() and c:IsSetCard(0x54)
end
function c80600059.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80600059.filter,tp,LOCATION_MZONE,0,1,nil) end
end
function c80600059.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c80600059.filter,tp,LOCATION_MZONE,0,nil)
	local tc=g:GetFirst()
	while tc do
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetValue(500*g:GetCount())
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_STANDBY+RESET_SELF_TURN)
		tc:RegisterEffect(e1)
		tc=g:GetNext()
	end
end
