--Soul Anchor
function c11111118.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c11111118.target)
	e1:SetOperation(c11111118.operation)
	c:RegisterEffect(e1)
	--Destroy
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_LEAVE_FIELD)
	e2:SetCondition(c11111118.descon2)
	e2:SetOperation(c11111118.desop2)
	c:RegisterEffect(e2)
end
function c11111118.filter(c)
	return c:IsFaceup() 
end
function c11111118.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c11111118.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c11111118.filter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c11111118.filter,tp,LOCATION_MZONE,0,1,1,nil)
end
function c11111118.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and tc:IsFaceup() and tc:IsRelateToEffect(e) then
		c:SetCardTarget(tc)
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_FIELD)
		e1:SetRange(LOCATION_SZONE)
		e1:SetTargetRange(LOCATION_MZONE,0)
		e1:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetTarget(c11111118.indtg)
		e1:SetValue(1)
		c:RegisterEffect(e1)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_FIELD)
		e2:SetRange(LOCATION_SZONE)
		e2:SetTargetRange(LOCATION_MZONE,0)
		e2:SetCode(EFFECT_CANNOT_CHANGE_POS_E)
		e2:SetReset(RESET_EVENT+0x1fe0000)
		e2:SetTarget(c11111118.indtg)
		e2:SetValue(1)
		c:RegisterEffect(e2)
		local e3=Effect.CreateEffect(c)
		e3:SetType(EFFECT_TYPE_FIELD)
		e3:SetRange(LOCATION_SZONE)
		e3:SetTargetRange(LOCATION_MZONE,0)
		e3:SetCode(EFFECT_CANNOT_CHANGE_POSITION)
		e3:SetReset(RESET_EVENT+0x1fe0000)
		e3:SetTarget(c11111118.indtg)
		e3:SetValue(1)
		c:RegisterEffect(e3)
	end
end
function c11111118.indtg(e,c)
	return e:GetHandler():GetFirstCardTarget()==c
end
function c11111118.descon2(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetHandler():GetFirstCardTarget()
	return tc and eg:IsContains(tc)
end
function c11111118.desop2(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),REASON_EFFECT)
end