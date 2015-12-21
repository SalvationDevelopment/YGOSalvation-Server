--Scripted by Eerie Code
--PSYFrame Lord Omega
function c74586817.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure(c,nil,aux.NonTuner(nil),1)
	c:EnableReviveLimit()
	--Banish
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(74586817,0))
	e1:SetCategory(CATEGORY_REMOVE)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCondition(c74586817.rmcon)
	e1:SetTarget(c74586817.rmtg)
	e1:SetOperation(c74586817.rmop)
	c:RegisterEffect(e1)
	--To Grave
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(74586817,1))
	e3:SetCategory(CATEGORY_TOGRAVE)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCountLimit(1)
	e3:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e3:SetCondition(c74586817.tgcon)
	e3:SetTarget(c74586817.tgtg)
	e3:SetOperation(c74586817.operation)
	c:RegisterEffect(e3)
	--To Deck, why the hell did this say To Hand before?
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(74586817,2))
	e2:SetCategory(CATEGORY_TODECK)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetTarget(c74586817.thtg)
	e2:SetOperation(c74586817.thop)
	c:RegisterEffect(e2)
end

function c74586817.rmcon(e,tp,eg,ep,ev,re,r,rp)
	local ph=Duel.GetCurrentPhase()
	return ph==PHASE_MAIN1 or ph==PHASE_MAIN2
end
function c74586817.rmtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsAbleToRemove,tp,0,LOCATION_HAND,1,nil) end
	local pre=e:GetHandler():GetControler()
	Duel.SetTargetPlayer(1-pre)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,nil,1,1-pre,LOCATION_HAND)
end
function c74586817.rmop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local p=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER)
	local g=Duel.GetFieldGroup(p,LOCATION_HAND,0)
	if not c:IsFaceup() or not c:IsLocation(LOCATION_MZONE) then return end
	if g:GetCount()==0 then return end
	local sg=g:RandomSelect(p,1)
	Duel.Remove(sg,POS_FACEUP,REASON_EFFECT)
	local tc=sg:GetFirst()
	tc:RegisterFlagEffect(74586817,RESET_EVENT+0x1fe0000,0,0)
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(74586817,3))
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e1:SetReset(RESET_PHASE+PHASE_STANDBY+RESET_SELF_TURN)
	e1:SetCountLimit(1)
	e1:SetLabelObject(tc)
	e1:SetCondition(c74586817.retcon)
	e1:SetOperation(c74586817.retop1)
	Duel.RegisterEffect(e1,tp)
	Duel.Remove(c,0,REASON_EFFECT+REASON_TEMPORARY)
	c:RegisterFlagEffect(74586817,RESET_EVENT+0x1fe0000,0,0)
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(74586817,4))
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e2:SetReset(RESET_PHASE+PHASE_STANDBY+RESET_SELF_TURN)
	e2:SetCountLimit(1)
	e2:SetLabelObject(c)
	e2:SetCondition(c74586817.retcon)
	e2:SetOperation(c74586817.retop2)
	Duel.RegisterEffect(e2,tp)
end
function c74586817.retcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c74586817.retop1(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetLabelObject()
	if tc:GetFlagEffect(74586817)~=0 then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
	end
	e:Reset()
end
function c74586817.retop2(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetLabelObject()
	if tc:GetFlagEffect(74586817)~=0 then
		Duel.ReturnToField(tc)
	end
	e:Reset()
end

function c74586817.tgcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()~=tp
end
function c74586817.tgfilter(c)
	return c:IsFaceup()
end
function c74586817.tgtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_REMOVED) and chkc:IsControler(tp) and c74586817.tgfilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c74586817.tgfilter,tp,LOCATION_REMOVED,LOCATION_REMOVED,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectTarget(tp,c74586817.tgfilter,tp,LOCATION_REMOVED,LOCATION_REMOVED,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,g,1,0,0)
end
function c74586817.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local tc=Duel.GetFirstTarget()
	if not tc:IsRelateToEffect(e) then return end
	Duel.SendtoGrave(tc,REASON_EFFECT+REASON_RETURN)
end

function c74586817.thfil(c)
	return c:IsAbleToDeck()
end
function c74586817.thtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and c74586817.thfil(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c74586817.thfil,tp,LOCATION_GRAVE,LOCATION_GRAVE,1,e:GetHandler()) and e:GetHandler():IsAbleToDeck() end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATODECK)
	local g=Duel.SelectTarget(tp,c74586817.thfil,tp,LOCATION_GRAVE,LOCATION_GRAVE,1,1,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,1,0,0)
end
function c74586817.thop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoDeck(e:GetHandler(),nil,2,REASON_EFFECT)
		Duel.SendtoDeck(tc,nil,2,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end