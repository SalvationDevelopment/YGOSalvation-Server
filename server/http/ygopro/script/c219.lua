--Southern Cross
function c219.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c219.target)
	e1:SetOperation(c219.activate)
	c:RegisterEffect(e1)
end
function c219.filter(c)
	local lv=c:GetLevel()
	return c:IsFaceup() and lv>0 and lv~=10
end
function c219.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c219.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c219.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c219.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
end
function c219.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_CHANGE_LEVEL)
		e1:SetValue(10)
		tc:RegisterEffect(e1)
	end
end
