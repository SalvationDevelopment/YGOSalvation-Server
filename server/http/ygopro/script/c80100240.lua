--ユニゾンビ
function c80100240.initial_effect(c)
	--lv change
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80100240,0))
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1,80100240)
	e1:SetTarget(c80100240.target)
	e1:SetOperation(c80100240.operation)
	c:RegisterEffect(e1)
	--lv change
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100240,1))
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1,80101240)
	e2:SetTarget(c80100240.target1)
	e2:SetOperation(c80100240.operation1)
	c:RegisterEffect(e2)
end
function c80100240.filter(c)
	return c:IsFaceup() and c:IsLevelAbove(1)
end
function c80100240.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c80100240.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80100240.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) 
		and Duel.IsExistingMatchingCard(Card.IsDiscardable,tp,LOCATION_HAND,0,1,nil) 
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c80100240.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
end
function c80100240.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.DiscardHand(tp,Card.IsDiscardable,1,1,REASON_DISCARD)<1 then return end
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetCode(EFFECT_UPDATE_LEVEL)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetValue(1)
		tc:RegisterEffect(e1)
	end
end
function c80100240.filter1(c)
	return c:IsFaceup() and c:IsLevelAbove(1)
end
function c80100240.tgfilter(c)
	return c:IsRace(RACE_ZOMBIE) and c:IsAbleToGrave()
end
function c80100240.target1(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c80100240.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80100240.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) 
		and Duel.IsExistingMatchingCard(c80100240.tgfilter,tp,LOCATION_DECK,0,1,nil) 
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c80100240.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_DECK)
end
function c80100240.operation1(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	local g=Duel.SelectMatchingCard(tp,c80100240.tgfilter,tp,LOCATION_DECK,0,1,1,nil)
	local tcc=g:GetFirst()
	if tcc and Duel.SendtoGrave(tcc,REASON_EFFECT)~=0 and tcc:IsLocation(LOCATION_GRAVE)
	and tc and tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetCode(EFFECT_UPDATE_LEVEL)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetValue(1)
		tc:RegisterEffect(e1)		
	end
	local e2=Effect.CreateEffect(e:GetHandler())
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CANNOT_ATTACK)
	e2:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE)
	e2:SetTargetRange(LOCATION_MZONE,0)
	e2:SetTarget(c80100240.atktg)
	e2:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e2,tp)
end
function c80100240.atktg(e,c)
	return not c:IsRace(RACE_ZOMBIE)
end