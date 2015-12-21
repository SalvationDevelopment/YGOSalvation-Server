--Exod Flame
function c13701812.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c13701812.target0)
	e1:SetOperation(c13701812.operation0)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCategory(CATEGORY_TOGRAVE+CATEGORY_TOHAND)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetCost(c13701812.cost)
	e2:SetTarget(c13701812.target1)
	e2:SetOperation(c13701812.operation1)
	c:RegisterEffect(e2)
	--tohand
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_TOHAND)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetCost(c13701812.cost)
	e3:SetCondition(c13701812.condition2)
	e3:SetTarget(c13701812.target2)
	e3:SetOperation(c13701812.operation2)
	c:RegisterEffect(e3)
end
function c13701812.exodfilter(c)
	return (c:IsCode(12600382) or c:IsCode(33244944) or c:IsCode(8124921) or c:IsCode(44519536) or 
	c:IsCode(70903634) or c:IsCode(7902349) or c:IsCode(33396948) or c:IsCode(13701813)) and 
	((c:IsLocation(LOCATION_DECK+LOCATION_HAND) and c:IsAbleToGrave()) or (c:IsLocation(LOCATION_GRAVE) and c:IsAbleToHand()))
end
function c13701812.target0(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	if Duel.GetFlagEffect(tp,13701812)==0 
		and Duel.IsExistingMatchingCard(c13701812.exodfilter,tp,LOCATION_DECK+LOCATION_HAND,0,1,nil) 
		and Duel.IsExistingTarget(Card.IsAbleToHand,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) then
		if Duel.SelectYesNo(tp,aux.Stringid(13701812,0)) then
			e:SetLabel(1)
			e:SetCategory(CATEGORY_TOGRAVE+CATEGORY_TOHAND)
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
			Duel.RegisterFlagEffect(tp,13701812,RESET_PHASE+PHASE_END,0,1)
			local g=Duel.SelectTarget(tp,Card.IsAbleToHand,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
			Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_DECK)
		else
			e:SetLabel(0)
		end
	end
end
function c13701812.operation0(e,tp,eg,ep,ev,re,r,rp)
	if e:GetLabel()==0 or not e:GetHandler():IsRelateToEffect(e) then return end
	local tc=Duel.GetFirstTarget()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c13701812.exodfilter,tp,LOCATION_DECK+LOCATION_HAND,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoGrave(g,REASON_EFFECT)
		if tc:IsRelateToEffect(e) then
			Duel.SendtoHand(tc,nil,REASON_EFFECT)
		end
	end
end
function c13701812.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,13701812)==0 end
	Duel.RegisterFlagEffect(tp,13701812,RESET_PHASE+PHASE_END,0,1)
end
function c13701812.target1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13701812.exodfilter,tp,LOCATION_DECK+LOCATION_HAND,0,1,nil) 
	and Duel.IsExistingTarget(Card.IsAbleToHand,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end 
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local g=Duel.SelectTarget(tp,Card.IsAbleToHand,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_DECK)
end
function c13701812.operation1(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local tc=Duel.GetFirstTarget()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c13701812.exodfilter,tp,LOCATION_DECK+LOCATION_HAND,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoGrave(g,REASON_EFFECT)
		if tc:IsRelateToEffect(e) then
			Duel.SendtoHand(tc,nil,REASON_EFFECT)
		end
	end
end
function c13701812.condition2(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end
function c13701812.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and exodfilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13701812.exodfilter,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c13701812.exodfilter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c13701812.operation2(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end