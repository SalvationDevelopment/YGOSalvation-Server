--Jammer Slime
function c240.initial_effect(c)
--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_NEGATE+CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_CHAINING)
	e1:SetCondition(c240.condition)
	e1:SetCost(c240.cost)
	e1:SetTarget(c240.target)
	e1:SetOperation(c240.activate)
	c:RegisterEffect(e1)
end
function c240.condition(e,tp,eg,ep,ev,re,r,rp)
	return re:IsHasType(EFFECT_TYPE_ACTIVATE) and Duel.IsChainNegatable(ev)
end
function c240.cfilter(c)
	return c:IsSetCard(0xb4) and c:IsType(TYPE_MONSTER) and c:IsDiscardable()
end
function c240.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c240.cfilter,tp,LOCATION_HAND,0,1,nil) end
	Duel.DiscardHand(tp,c240.cfilter,1,1,REASON_COST+REASON_DISCARD)
end
function c240.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,eg,1,0,0)
	if re:GetHandler():IsDestructable() and re:GetHandler():IsRelateToEffect(re) then
		Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,1,0,0)
	end
end 
function c240.activate(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateActivation(ev)
	if re:GetHandler():IsRelateToEffect(re) then
		Duel.Destroy(eg,REASON_EFFECT)
	end
end
