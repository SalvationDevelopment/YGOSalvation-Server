--Dark Burning Attack
function c13715000.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c13715000.condition)
	e1:SetTarget(c13715000.target)
	e1:SetOperation(c13715000.activate)
	c:RegisterEffect(e1)
end
function c13715000.cfilter(c)
	return c:IsFaceup() and c:IsCode(38033121)
end
function c13715000.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c13715000.cfilter,tp,LOCATION_ONFIELD,0,1,nil)
end
function c13715000.filter(c)
	return c:IsType(TYPE_MONSTER) and c:IsFaceup() and c:IsDestructable()
end
function c13715000.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return Duel.IsExistingMatchingCard(c13715000.filter,tp,0,LOCATION_ONFIELD,1,c) end
	local sg=Duel.GetMatchingGroup(c13715000.filter,tp,0,LOCATION_ONFIELD,c)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,sg,sg:GetCount(),0,0)
end
function c13715000.activate(e,tp,eg,ep,ev,re,r,rp)
	local sg=Duel.GetMatchingGroup(c13715000.filter,tp,0,LOCATION_ONFIELD,e:GetHandler())
	Duel.Destroy(sg,REASON_EFFECT)
end

