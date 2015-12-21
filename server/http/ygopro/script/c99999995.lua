--Orichalcos Malevolence
function c99999995.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_POSITION)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetTarget(c99999995.target)
	e1:SetOperation(c99999995.operation)
	c:RegisterEffect(e1)
end
function c99999995.filter(c)
	return c:IsFacedown() and c:IsDefencePos()
end
function c99999995.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and c99999995.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c99999995.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEDOWNDEFENCE)
	local g=Duel.SelectTarget(tp,c99999995.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c99999995.operation(e,tp,eg,ep,ev,re,r,rp,chk)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and c99999995.filter(tc) then
		Duel.ChangePosition(tc,0,0,0,POS_FACEUP_ATTACK,true)
	end
end
