--Junk Changer
function c13701831.initial_effect(c)
	--lv change
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1,13701831)
	e1:SetTarget(c13701831.target)
	e1:SetOperation(c13701831.operation)
	c:RegisterEffect(e1)
end
function c13701831.filter(c)
	return c:IsFaceup() and c:IsSetCard(0x43) and c:IsLevelAbove(1)
end
function c13701831.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c13701831.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13701831.filter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c13701831.filter,tp,LOCATION_MZONE,0,1,1,nil)
	local tc=g:GetFirst()
	local op=0
	if tc:GetLevel()==1 then op=Duel.SelectOption(tp,aux.Stringid(13701831,0))
	else op=Duel.SelectOption(tp,aux.Stringid(13701831,0),aux.Stringid(13701831,1)) end
	e:SetLabel(op)
end
function c13701831.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_LEVEL)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		if e:GetLabel()==0 then
			e1:SetValue(1)
		else e1:SetValue(-1) end
		tc:RegisterEffect(e1)
	end
end
