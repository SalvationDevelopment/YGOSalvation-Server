--Dark Spell Regeneration
function c12306.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOGRAVE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c12306.condition)	
	e1:SetCost(c12306.cost)
	e1:SetTarget(c12306.target)	
	e1:SetOperation(c12306.activate)
	c:RegisterEffect(e1)
end

function c12306.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(Card.IsRace,tp,LOCATION_GRAVE,0,1,nil,RACE_SPELLCASTER)
end

function c12306.filter(c)
	return c:IsCode(12306) and c:IsAbleToRemoveAsCost()
end
function c12306.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c12306.filter,tp,LOCATION_HAND+LOCATION_DECK,0,2,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c12306.filter,tp,LOCATION_HAND+LOCATION_DECK,0,2,2,nil)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end

function c12306.thfilter(c)
	return c:IsType(TYPE_SPELL) and c:IsAbleToHand()
end
function c12306.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_DECK+LOCATION_GRAVE) and c12306.thfilter(chkc) end
	if chk==0 then return e:GetHandler():GetFlagEffect(12306)==0
		and Duel.IsExistingTarget(c12306.thfilter,tp,LOCATION_DECK+LOCATION_GRAVE,LOCATION_DECK+LOCATION_GRAVE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local g=Duel.SelectTarget(tp,c12306.thfilter,tp,LOCATION_DECK+LOCATION_GRAVE,LOCATION_GRAVE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c12306.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,tp,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end