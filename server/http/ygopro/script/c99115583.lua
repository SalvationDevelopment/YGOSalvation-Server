--The Phantom Knights of Crack Helm
--By: HelixReactor
function c99115583.initial_effect(c)
	--Atk-up
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EVENT_TO_GRAVE)
	e1:SetCountLimit(1,99115583)
	e1:SetCondition(c99115583.atkcon)
	e1:SetOperation(c99115583.atkop)
	c:RegisterEffect(e1)
	--tohand
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetCountLimit(1,99115584)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCost(c99115583.thcost)
	e2:SetTarget(c99115583.thtg)
	e2:SetOperation(c99115583.wop)
	c:RegisterEffect(e2)
end
function c99115583.atkfilter(c,tp)
	return (c:IsSetCard(0x1373) or (c:IsSetCard(0x1374) and c:IsType(TYPE_SPELL+TYPE_TRAP))) and c:IsLocation(LOCATION_GRAVE)
end
function c99115583.atkcon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c99115583.atkfilter,1,nil,tp) and e:GetHandler():IsFaceup()
end
function c99115583.atkop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetValue(500)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		c:RegisterEffect(e1)
	end
end
function c99115583.thcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c99115583.thfilter(c)
	return (c:IsSetCard(0x1373) or (c:IsSetCard(0x1374) and c:IsType(TYPE_SPELL+TYPE_TRAP))) and c:IsAbleToHand()
end
function c99115583.thtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c99115583.thfilter,tp,LOCATION_GRAVE,0,1,e:GetHandler()) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_GRAVE)
end
function c99115583.wop(e,tp,eg,ep,ev,re,r,rp)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_PHASE+PHASE_END)
	e1:SetCountLimit(1)
	e1:SetOperation(c99115583.thop)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end
function c99115583.thop(e,tp,eg,ep,ev,re,r,rp)
	if not Duel.IsExistingMatchingCard(c99115583.thfilter,tp,LOCATION_GRAVE,0,1,nil) then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c99115583.thfilter,tp,LOCATION_GRAVE,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end