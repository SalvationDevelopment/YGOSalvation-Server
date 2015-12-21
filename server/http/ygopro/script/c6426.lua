--PSYFrame Overload
function c6426.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_END_PHASE)
	e1:SetTarget(c6426.target1)
	e1:SetOperation(c6426.operation)
	c:RegisterEffect(e1)
	--remove
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(6426,1))
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetHintTiming(0,TIMING_END_PHASE)
	e2:SetCost(c6426.cost2)
	e2:SetTarget(c6426.target2)
	e2:SetOperation(c6426.operation)
	c:RegisterEffect(e2)
	--to hand
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e3:SetType(EFFECT_TYPE_QUICK_O)
	e3:SetCode(EVENT_FREE_CHAIN)
	e3:SetRange(LOCATION_GRAVE)
	e3:SetCost(c6426.thcost)
	e3:SetTarget(c6426.thtg)
	e3:SetOperation(c6426.thop)
	c:RegisterEffect(e3)
	--sent to grave flag
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(15341821,0))
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e4:SetCode(EVENT_TO_GRAVE)
	e4:SetCondition(c6426.condition)
	e4:SetOperation(c6426.op)
	c:RegisterEffect(e4)
	
end
function c6426.cfilter(c)
	return (c:IsLocation(LOCATION_HAND) or c:IsFaceup()) and c:IsType(TYPE_MONSTER) and
	c:IsSetCard(0xd3) and c:IsAbleToRemoveAsCost()
end
function c6426.target1(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return (chkc:IsLocation(LOCATION_HAND) or chkc:IsLocation(LOCATION_MZONE)) and chkc:IsControler(1-tp) and chkc:IsAbleToRemove() end
	if chk==0 then return true end
	if Duel.IsExistingMatchingCard(c6426.cfilter,tp,LOCATION_HAND+LOCATION_MZONE,0,1,nil)
		and Duel.IsExistingTarget(Card.IsAbleToRemove,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,nil) and Duel.SelectYesNo(tp,aux.Stringid(6426,0)) then
		e:SetProperty(EFFECT_FLAG_CARD_TARGET)
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
		local cg=Duel.SelectMatchingCard(tp,c6426.cfilter,tp,LOCATION_HAND+LOCATION_MZONE,0,1,1,nil)
		Duel.Remove(cg,POS_FACEUP,REASON_COST)
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
		local g=Duel.SelectTarget(tp,Card.IsAbleToRemove,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,1,nil)
		Duel.SetOperationInfo(0,CATEGORY_REMOVE,g,1,0,0)
		e:GetHandler():RegisterFlagEffect(6426,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	else e:SetProperty(0) end
end
function c6426.cost2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c6426.cfilter,tp,LOCATION_HAND+LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local cg=Duel.SelectMatchingCard(tp,c6426.cfilter,tp,LOCATION_HAND+LOCATION_MZONE,0,1,1,nil)
	Duel.Remove(cg,POS_FACEUP,REASON_COST)
end
function c6426.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_ONFIELD) and chkc:IsControler(1-tp) and chkc:IsAbleToRemove() end
	if chk==0 then return e:GetHandler():GetFlagEffect(6426)==0
		and Duel.IsExistingTarget(Card.IsAbleToRemove,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectTarget(tp,Card.IsAbleToRemove,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,g,1,0,0)
	e:GetHandler():RegisterFlagEffect(6426,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
end
function c6426.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.Remove(tc,POS_FACEDOWN,REASON_EFFECT)
	end
end
function c6426.thcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_EFFECT)
end
function c6426.thfilter(c)
	return c:IsSetCard(0xd3) and c:IsAbleToHand() and not c:IsCode(6426)
end
function c6426.thtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c6426.thfilter,tp,LOCATION_DECK,0,1,nil) 
	and e:GetHandler():GetFlagEffect(64126)==0 end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c6426.thop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c6426.thfilter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
function c6426.condition(e,tp,eg,ep,ev,re,r,rp)
	return not e:GetHandler():IsReason(REASON_RETURN)
end
function c6426.op(e,tp,eg,ep,ev,re,r,rp)
	e:GetHandler():RegisterFlagEffect(64126,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
end
