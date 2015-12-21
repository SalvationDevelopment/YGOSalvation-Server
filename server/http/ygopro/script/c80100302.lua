-- 黒・爆・裂・破・魔・導
function c80100302.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80100302.condition)
	e1:SetTarget(c80100302.target)
	e1:SetOperation(c80100302.activate)
	c:RegisterEffect(e1)
end
function c80100302.cfilter(c,code)
	return c:IsFaceup() and c:IsCode(code)
end
function c80100302.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80100302.cfilter,tp,LOCATION_MZONE,0,1,nil,46986414)
		and Duel.IsExistingMatchingCard(c80100302.cfilter,tp,LOCATION_MZONE,0,1,nil,38033121)
end
function c80100302.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsDestructable,tp,0,LOCATION_ONFIELD,1,nil) end
	local g=Duel.GetMatchingGroup(Card.IsDestructable,tp,0,LOCATION_ONFIELD,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c80100302.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(Card.IsDestructable,tp,0,LOCATION_ONFIELD,nil)
	Duel.Destroy(g,REASON_EFFECT)
end
