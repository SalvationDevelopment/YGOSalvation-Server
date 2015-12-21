--Dark Burning Magic
function c13725006.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c13725006.condition)
	e1:SetTarget(c13725006.target)
	e1:SetOperation(c13725006.activate)
	c:RegisterEffect(e1)
end
function c13725006.cfilter(c,code)
	return c:IsFaceup() and c:GetOriginalCode()==code
end
function c13725006.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c13725006.cfilter,tp,LOCATION_MZONE,0,1,nil,38033121)
		and Duel.IsExistingMatchingCard(c13725006.cfilter,tp,LOCATION_MZONE,0,1,nil,46986414)
end
function c13725006.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsDestructable,tp,0,LOCATION_ONFIELD,1,nil) end
	local g=Duel.GetMatchingGroup(Card.IsDestructable,tp,0,LOCATION_ONFIELD,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c13725006.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(Card.IsDestructable,tp,0,LOCATION_ONFIELD,nil)
	Duel.Destroy(g,REASON_EFFECT)
end
