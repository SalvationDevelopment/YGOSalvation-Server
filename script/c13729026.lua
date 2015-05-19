--Pendulum Call
function c13729026.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13729026+EFFECT_COUNT_CODE_OATH)
	e1:SetCost(c13729026.cost)
	e1:SetTarget(c13729026.target)
	e1:SetOperation(c13729026.activate)
	c:RegisterEffect(e1)
	Duel.AddCustomActivityCounter(13729026,ACTIVITY_CHAIN,c13729026.chainfilter)
end
function c13729026.chainfilter(re,tp,cid)
	return not (re:GetHandler():IsSetCard(0x98) and re:GetHandler():IsLocation(LOCATION_SZONE) 
	and re:GetHandler():IsType(TYPE_PENDULUM) and not re:IsHasType(EFFECT_TYPE_ACTIVATE))
end
function c13729026.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsAbleToGraveAsCost,tp,LOCATION_HAND,0,1,e:GetHandler()) end
	Duel.DiscardHand(tp,Card.IsAbleToGraveAsCost,1,1,REASON_COST)
end
function c13729026.filter(c)
	return c:IsType(TYPE_PENDULUM) and c:IsSetCard(0x98) and c:IsAbleToHand()
end
function c13729026.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13729026.filter,tp,LOCATION_DECK,0,2,nil)
	and Duel.GetCustomActivityCount(13729026,tp,ACTIVITY_CHAIN)==0 end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c13729026.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local g=Duel.GetMatchingGroup(c13729026.filter,tp,LOCATION_DECK,0,nil)
	if g:GetCount()==0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g1=g:Select(tp,1,1,nil)
	g:Remove(Card.IsCode,nil,g1:GetFirst():GetCode())
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
		local g2=g:Select(tp,1,1,nil)
		g:Remove(Card.IsCode,nil,g2:GetFirst():GetCode())
		g1:Merge(g2)
	Duel.SendtoHand(g1,nil,REASON_EFFECT)
	Duel.ConfirmCards(1-tp,g1)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e1:SetTargetRange(LOCATION_SZONE,0)
	e1:SetTarget(c13729026.indtg)
	e1:SetValue(c13729026.indval)
	e1:SetReset(RESET_PHASE+PHASE_END,2)
	Duel.RegisterEffect(e1,tp)
end
function c13729026.indtg(e,c)
	return c:GetSequence()>5 and c:IsSetCard(0x98)
end
function c13729026.indval(e,re,tp)
	return tp~=e:GetHandlerPlayer()
end
