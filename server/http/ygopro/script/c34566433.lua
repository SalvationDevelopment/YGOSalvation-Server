--Edge Imp DT Modoki
function c34566433.initial_effect(c)
	--atk def
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_ATKCHANGE+CATEGORY_DEFCHANGE)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1,34566433)
	e1:SetTarget(c34566433.target)
	e1:SetOperation(c34566433.operation)
	c:RegisterEffect(e1)
end
function c34566433.filter(c,tp)
	return c:IsSetCard(0xad) and c:IsType(TYPE_FUSION)
end
function c34566433.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.IsExistingMatchingCard(c34566433.filter,tp,LOCATION_MZONE+LOCATION_GRAVE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c34566433.filter,tp,LOCATION_MZONE+LOCATION_GRAVE,0,1,1,nil)
end
function c34566433.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsRelateToEffect(e) and tc and tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_SET_ATTACK)
		e1:SetValue(tc:GetAttack())
		e1:SetReset(RESET_PHASE+PHASE_END)
		c:RegisterEffect(e1)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_SET_DEFENCE)
		e2:SetValue(tc:GetDefence())
		e2:SetReset(RESET_PHASE+PHASE_END)
		c:RegisterEffect(e2)
	end
end
