--Scripted by Eerie Code
--Rippling Mirror Force
function c6975.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCondition(c6975.condition)
	e1:SetTarget(c6975.target)
	e1:SetOperation(c6975.activate)
	c:RegisterEffect(e1)
end

function c6975.condition(e,tp,eg,ep,ev,re,r,rp)
	local at=Duel.GetAttacker()
	return at:GetControler()~=tp and Duel.GetAttackTarget()==nil
end
function c6975.filter(c)
	return c:IsPosition(POS_FACEUP_ATTACK) and c:IsAbleToDeck()
end
function c6975.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c6975.filter,tp,0,LOCATION_MZONE,1,nil) end
	local g=Duel.GetMatchingGroup(c6975.filter,tp,0,LOCATION_MZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,g:GetCount(),0,0)
end
function c6975.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c6975.filter,tp,0,LOCATION_MZONE,nil)
	Duel.SendtoDeck(g,nil,2,REASON_EFFECT)
end