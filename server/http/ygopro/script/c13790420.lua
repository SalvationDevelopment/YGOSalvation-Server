--Madolche Puddingcess Choco A La Mode
function c13790420.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.FilterBoolFunction(Card.IsAttribute,ATTRIBUTE_EARTH),5,2,c13790420.ovfilter,aux.Stringid(99469936,0))
	c:EnableReviveLimit()
	--todeck
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTarget(c13790420.target1)
	e1:SetOperation(c13790420.operation1)
	c:RegisterEffect(e1)
	--search
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCode(EVENT_TO_DECK)
	e2:SetCost(c13790420.cost)
	e2:SetCondition(c13790420.condition)
	e2:SetTarget(c13790420.target)
	e2:SetOperation(c13790420.operation)
	c:RegisterEffect(e2)
end
function c13790420.ovfilter(c)
	return c:IsType(TYPE_XYZ) and c:GetRank()<=4 and c:IsSetCard(0x71)
end
function c13790420.filter(c)
	return c:IsSetCard(0x71) and c:IsAbleToDeck()
end
function c13790420.target1(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	if chk==0 then return Duel.IsExistingTarget(c13790420.filter,tp,LOCATION_GRAVE,0,2,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,c13790420.filter,tp,LOCATION_GRAVE,0,2,2,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,2,0,0)
end
function c13790420.operation1(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local sg=g:Filter(Card.IsRelateToEffect,nil,e)
	Duel.SendtoDeck(sg,nil,2,REASON_EFFECT)
end

function c13790420.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c13790420.cfilter(c,tp)
	return c:IsControler(tp) and c:GetPreviousControler()==tp
		and c:IsPreviousLocation(LOCATION_GRAVE) and c:IsSetCard(0x71) and not c:IsLocation(LOCATION_EXTRA)
end
function c13790420.condition(e,tp,eg,ep,ev,re,r,rp)
	return bit.band(r,REASON_EFFECT)~=0 and eg:IsExists(c13790420.cfilter,1,nil,tp) and e:GetHandler():GetOverlayGroup():IsExists(Card.IsCode,1,nil,74641045)
end
function c13790420.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsRelateToEffect(e) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c13790420.filter2(c,e,tp)
	return c:IsSetCard(0x71) and c:IsType(TYPE_MONSTER)
		and c:IsCanBeSpecialSummoned(e,0,tp,false,false,POS_FACEUP_ATTACK)
end
function c13790420.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
		local g=Duel.SelectMatchingCard(tp,c13790420.filter2,tp,LOCATION_DECK,0,1,1,nil,e,tp)
		local tc=g:GetFirst()
			Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP_ATTACK+POS_FACEDOWN_DEFENCE)
end
