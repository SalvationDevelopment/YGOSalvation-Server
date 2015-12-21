--渾沌の種
function c80700004.initial_effect(c)
	--add
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCondition(c80700004.con)
	e1:SetCost(c80700004.cost)
	e1:SetTarget(c80700004.tg)
	e1:SetOperation(c80700004.op)
	c:RegisterEffect(e1)
end
function c80700004.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80700004)==0 end
	Duel.RegisterFlagEffect(tp,80700004,RESET_PHASE+PHASE_END,0,1)
end
function c80700004.tfilter(c,att)
	return c:IsAttribute(att) and c:IsFaceup()
end
function c80700004.con(e)
	return Duel.IsExistingMatchingCard(c80700004.tfilter,tp,LOCATION_MZONE,0,1,nil,ATTRIBUTE_LIGHT) and
		Duel.IsExistingMatchingCard(c80700004.tfilter,tp,LOCATION_MZONE,0,1,nil,ATTRIBUTE_DARK)
end
function c80700004.tg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80700004.filter,tp,LOCATION_REMOVED,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c80700004.filter,tp,LOCATION_REMOVED,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_REMOVED)
end
function c80700004.filter(c)
	return c:IsRace(RACE_WARRIOR) and (c:IsAttribute(ATTRIBUTE_LIGHT) or c:IsAttribute(ATTRIBUTE_DARK)) and c:IsAbleToHand()
end
function c80700004.op(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
	end
end