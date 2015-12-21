--Realize Defense
function c11111143.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOGRAVE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c11111143.target)
	e1:SetOperation(c11111143.activate)
	c:RegisterEffect(e1)
end
function c11111143.filter(c)
	return c:IsPosition(POS_FACEUP_ATTACK) and c:GetBaseDefence()>c:GetBaseAttack()
end
function c11111143.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c11111143.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c11111143.filter,tp,LOCATION_MZONE,0,1,nil) end
	local g=Duel.SelectTarget(tp,c11111143.filter,tp,LOCATION_MZONE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c11111143.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsPosition(POS_FACEUP_ATTACK) then
		Duel.ChangePosition(tc,POS_FACEUP_DEFENCE)
	end
end