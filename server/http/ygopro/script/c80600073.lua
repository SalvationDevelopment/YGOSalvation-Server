--ゴーストリック・アウト
function c80600073.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80600073.con)
	e1:SetCost(c80600073.cost)
	e1:SetOperation(c80600073.op)
	c:RegisterEffect(e1)
end
function c80600073.cfilter(c)
	return c:IsSetCard(0x91) and c:IsType(TYPE_MONSTER)
end
function c80600073.con(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80600073.cfilter,tp,LOCATION_HAND,0,1,nil)
end
function c80600073.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80600073.cfilter,tp,LOCATION_HAND,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONFIRM)
	local g=Duel.SelectMatchingCard(tp,c80600073.cfilter,tp,LOCATION_HAND,0,1,1,nil)
	Duel.ConfirmCards(1-tp,g)
	Duel.ShuffleHand(tp)
end
function c80600073.op(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local g=Duel.GetMatchingGroup(c80600073.indtg,tp,LOCATION_ONFIELD,0,nil)
	local tc=g:GetFirst()
	while tc do
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
	e1:SetValue(1)
	tc:RegisterEffect(e1)
	local e2=Effect.CreateEffect(e:GetHandler())
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	e2:SetValue(1)
	e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	tc:RegisterEffect(e2)
	tc=g:GetNext()
	end
end
function c80600073.indtg(c)
	return c:IsSetCard(0x91) or c:IsPosition(POS_FACEDOWN) and c:IsType(TYPE_MONSTER)
end