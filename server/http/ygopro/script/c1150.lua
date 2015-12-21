--アースクエイク
function c1150.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_POSITION)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c1150.target)
	e1:SetOperation(c1150.activate)
	c:RegisterEffect(e1)
end
function c1150.filter(c)
	return c:IsFaceup() and c:IsAttackPos()
end
function c1150.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c1150.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	local g=Duel.GetMatchingGroup(c1150.filter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,g:GetCount(),0,0)
end
function c1150.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c1150.filter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	Duel.ChangePosition(g,POS_FACEUP_DEFENCE)
end
