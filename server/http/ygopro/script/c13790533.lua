--Igknight Burst
function c13790533.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_REMOVE)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCountLimit(1)
	e2:SetTarget(c13790533.rmtg)
	e2:SetOperation(c13790533.rmop)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetCondition(c13790533.condition)
	e3:SetTarget(c13790533.target)
	e3:SetOperation(c13790533.operation)
	c:RegisterEffect(e3)
end
function c13790533.rmfilter(c)
	return c:IsSetCard(0xc6)
end
function c13790533.rmtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_ONFIELD) and c13790533.rmfilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13790533.rmfilter,tp,LOCATION_ONFIELD,0,1,nil) end
	local g=Duel.SelectTarget(tp,c13790533.rmfilter,tp,LOCATION_ONFIELD,0,1,3,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,g,g:GetCount(),0,0)
end
function c13790533.rmop(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(Card.IsRelateToEffect,nil,e)
	local ct=Duel.Destroy(g,REASON_EFFECT)
	local c=e:GetHandler()
	if ct>0 and c:IsFaceup() and c:IsRelateToEffect(e) then
		local dg=Duel.GetMatchingGroup(Card.IsDestructable,tp,0,LOCATION_ONFIELD,nil)
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
			local des=dg:Select(tp,ct,ct,nil)
			Duel.HintSelection(des)
			Duel.BreakEffect()
			Duel.SendtoHand(des,nil,REASON_EFFECT)
	end
end

function c13790533.condition(e,tp,eg,ep,ev,re,r,rp)
	return not e:GetHandler():IsReason(REASON_RETURN)
end
function c13790533.filter(c)
	return c:IsFaceup() and c:IsSetCard(0xc6) and c:IsAbleToHand()
end
function c13790533.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790533.filter,tp,LOCATION_EXTRA,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_EXTRA)
end
function c13790533.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c13790533.filter,tp,LOCATION_EXTRA,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
