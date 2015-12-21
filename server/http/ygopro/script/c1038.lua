--コアラッコ
--NYAAAAAAAAAAAAAAAAAAAAAA
function c1038.initial_effect(c)
	--atk down
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(1038,0))
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCondition(c1038.condition)
	e1:SetTarget(c1038.target)
	e1:SetOperation(c1038.operation)
	c:RegisterEffect(e1)
end
function c1038.cfilter(c)
	return c:IsFaceup() and c:IsType(TYPE_MONSTER)
end
function c1038.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c1038.cfilter,tp,LOCATION_MZONE,0,1,e:GetHandler())
end
function c1038.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsFaceup() and chkc:IsControler(1-tp) and chkc:GetLocation()==LOCATION_MZONE end
	if chk==0 then return Duel.IsExistingTarget(Card.IsFaceup,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,Card.IsFaceup,tp,0,LOCATION_MZONE,1,1,nil)
end
function c1038.operation(e,tp,eg,ep,ev,re,r,rp)
	if not Duel.IsExistingMatchingCard(c1038.cfilter,tp,LOCATION_MZONE,0,1,e:GetHandler()) then return end
	local tc=Duel.GetFirstTarget()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_SET_ATTACK_FINAL)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		e1:SetValue(0)
		tc:RegisterEffect(e1)
	end
end
