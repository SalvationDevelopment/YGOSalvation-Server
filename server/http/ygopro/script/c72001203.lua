--Smile World
function c72001203.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(72001203,0))
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c72001203.target)
	e1:SetOperation(c72001203.activate)
	c:RegisterEffect(e1)
end
function c72001203.filter(c)
	return c:IsType(TYPE_MONSTER)
end
function c72001203.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.IsExistingTarget(Card.IsFaceup,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	local sg=Duel.GetMatchingGroup(Card.IsFaceup,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
end
function c72001203.activate(e,tp,eg,ep,ev,re,r,rp)
	local sg=Duel.GetMatchingGroup(Card.IsFaceup,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	local ct=Duel.GetMatchingGroupCount(c72001203.filter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	local tc=sg:GetFirst()
	while tc do
		if tc:IsFaceup() then
			local e1=Effect.CreateEffect(e:GetHandler())
			e1:SetDescription(aux.Stringid(72001203,1))
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetProperty(EFFECT_FLAG_CLIENT_HINT)
			e1:SetCode(EFFECT_UPDATE_ATTACK)
			e1:SetReset(RESET_EVENT+0xfe0000+RESET_PHASE+PHASE_END)
			e1:SetValue(ct*100)
			tc:RegisterEffect(e1)
		end
	tc=sg:GetNext()
	end
end