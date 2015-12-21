--黒・魔・導・爆・裂・破
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
function c80100302.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x10a2)
end
function c80100302.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80100302.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c80100302.desfilter(c)
	return c:IsFaceup() and c:IsDestructable()
end
function c80100302.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80100302.desfilter,tp,0,LOCATION_MZONE,1,nil) end
	local g=Duel.GetMatchingGroup(c80100302.desfilter,tp,0,LOCATION_MZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c80100302.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c80100302.desfilter,tp,0,LOCATION_MZONE,nil)
	Duel.Destroy(g,REASON_EFFECT)
end
