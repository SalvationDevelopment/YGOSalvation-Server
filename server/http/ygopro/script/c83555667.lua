-Ring of Destruction (Errata)
function c83555667.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY+CATEGORY_DAMAGE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCountLimit(1,83555667)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,0x1e1)
	e1:SetCondition(c83555667.condition)
	e1:SetTarget(c83555667.target)
	e1:SetOperation(c83555667.activate)
	c:RegisterEffect(e1)
end
function c83555667.condition(e,tp,eg,ep,ev,re,r,rp)
	return tp~=Duel.GetTurnPlayer()
end
function c83555667.filter(c,tp)
	local lp=Duel.GetLP(1)
	local atk=c:GetAttack()
	return c:IsFaceup() and c:GetAttack()<=lp and c:IsDestructable()
end
function c83555667.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c83555667.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c83555667.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c83555667.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,tp,0)
end
function c83555667.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() then
		local atk=tc:GetBaseAttack()
		if Duel.Destroy(tc,REASON_EFFECT)>0 then
			local dam=Duel.Damage(tp,atk,REASON_EFFECT)
			Duel.Damage(1-tp,dam,REASON_EFFECT)
		end
	end
end
