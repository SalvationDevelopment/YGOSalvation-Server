--Scripted by Eerie Code
--Moon-Light Black Sheep
function c11317977.initial_effect(c)
	--Salvage
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(11317977,0))
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_HAND)
	e1:SetCost(c11317977.cost)
	e1:SetTarget(c11317977.tg1)
	e1:SetOperation(c11317977.op1)
	c:RegisterEffect(e1)
	--Search Polymerization
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(11317977,1))
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_HAND)
	e2:SetCost(c11317977.cost)
	e2:SetTarget(c11317977.tg2)
	e2:SetOperation(c11317977.op2)
	c:RegisterEffect(e2)
	--Salvage post-Fusion
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(11317977,0))
	e3:SetCategory(CATEGORY_TOHAND)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_DELAY)
	e3:SetCode(EVENT_BE_MATERIAL)
	e3:SetCondition(c11317977.thcon)
	e3:SetTarget(c11317977.thtg)
	e3:SetOperation(c11317977.thop)
	c:RegisterEffect(e3)
end

function c11317977.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsDiscardable() end
	Duel.SendtoGrave(e:GetHandler(),REASON_COST+REASON_DISCARD)
end
function c11317977.fil1(c)
	return (c:IsSetCard(0xe1) or c:IsSetCard(0x209)) and c:IsType(TYPE_MONSTER) and not c:IsCode(11317977) and c:IsAbleToHand()
end
function c11317977.tg1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c11317977.fil1,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,0,0)
end
function c11317977.op1(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.SelectMatchingCard(tp,c11317977.fil1,tp,LOCATION_GRAVE,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,tp,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end

function c11317977.fil2(c)
	return c:IsCode(24094653) and c:IsAbleToHand()
end
function c11317977.tg2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.IsExistingMatchingCard(c11317977.fil2,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c11317977.op2(e,tp,eg,ep,ev,re,r,rp,chk)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c11317977.fil2,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end

function c11317977.thcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsLocation(LOCATION_GRAVE) and r==REASON_FUSION
end
function c11317977.thfilter(c)
	return (c:IsSetCard(0xe1) or c:IsSetCard(0x209)) and c:IsType(TYPE_MONSTER) and c:IsAbleToHand() and ((c:IsLocation(LOCATION_GRAVE) and not c:IsCode(11317977)) or (c:IsLocation(LOCATION_EXTRA) and c:IsFaceup() and c:IsType(TYPE_PENDULUM)))
end
function c11317977.thtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c11317977.thfilter,tp,LOCATION_GRAVE+LOCATION_EXTRA,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,0,0)
end
function c11317977.thop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.SelectMatchingCard(tp,c11317977.thfilter,tp,LOCATION_GRAVE+LOCATION_EXTRA,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,tp,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end