--森羅の守神 アルセイ
function c80800052.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,8),2)
	c:EnableReviveLimit()
	--announce
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80800052,0))
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetTarget(c80800052.target)
	e1:SetOperation(c80800052.operation)
	c:RegisterEffect(e1)
	--
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80800052,1))
	e2:SetCategory(CATEGORY_TODECK)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_DELAY+EFFECT_FLAG_CARD_TARGET)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetCondition(c80800052.con)
	e2:SetCost(c80800052.cost)
	e2:SetTarget(c80800052.tg)
	e2:SetOperation(c80800052.op)
	c:RegisterEffect(e2)
end
function c80800052.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)>0 end
	Duel.Hint(HINT_SELECTMSG,tp,0)
	local ac=Duel.AnnounceCard(tp)
	e:SetLabel(ac)
end
function c80800052.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)==0 then return end
	Duel.ConfirmDecktop(tp,1)
	local g=Duel.GetDecktopGroup(tp,1)
	local tc=g:GetFirst()
	if tc:GetCode()==e:GetLabel() and tc:IsAbleToHand() then
		Duel.DisableShuffleCheck()
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ShuffleHand(tp)
	else 
		Duel.SendtoGrave(tc,REASON_EFFECT)
	end
end
function c80800052.filter(c,tp)
	local pl=c:GetPreviousLocation()
	return c:GetPreviousLocation()==LOCATION_DECK and c:IsLocation(LOCATION_GRAVE) and c:GetControler()==tp
	and c:IsReason(REASON_EFFECT)
end
function c80800052.con(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c80800052.filter,1,nil,tp) 
end
function c80800052.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80800052)==0 and e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
	Duel.RegisterFlagEffect(tp,80800052,RESET_PHASE+PHASE_END,0,1)
end
function c80800052.tg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chkc then return chkc:IsLocation(LOCATION_ONFIELD) and chkc:IsAbleToDeck() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsAbleToDeck,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,Card.IsAbleToDeck,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,1,0,0)
end
function c80800052.op(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		local opt=Duel.SelectOption(tp,aux.Stringid(80800052,2),aux.Stringid(80800052,3))
		Duel.SendtoDeck(tc,nil,opt,REASON_EFFECT)
	end
end
