--Sacred Warrior Black Luster Soldier
function c13701002.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetCountLimit(1,13701002)
	e1:SetTarget(c13701002.target)
	e1:SetOperation(c13701002.activate)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_TOHAND)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_BATTLE_DESTROYING)
	e3:SetCondition(c13701002.thcon)
	e3:SetTarget(c13701002.thtg)
	e3:SetOperation(c13701002.thop)
	c:RegisterEffect(e3)
end
function c13701002.tgfilter(c)
	return c:IsType(TYPE_MONSTER) and (c:IsAttribute(ATTRIBUTE_LIGHT) or c:IsAttribute(ATTRIBUTE_DARK)) and c:IsAbleToGrave()
end
function c13701002.rmfilter(c)
	return c:IsAbleToRemove()
end
function c13701002.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	if chk==0 then return Duel.IsExistingMatchingCard(c13701002.tgfilter,tp,LOCATION_REMOVED,0,1,nil)
	and Duel.IsExistingMatchingCard(c13701002.rmfilter,tp,0,LOCATION_ONFIELD,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g1=Duel.SelectTarget(tp,c13701002.tgfilter,tp,LOCATION_REMOVED,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,g1,1,0,0)
	Duel.Hint(HINT_SELECTMSG,tp,CATEGORY_TOGRAVE)
	local g2=Duel.SelectTarget(tp,c13701002.rmfilter,tp,0,LOCATION_ONFIELD,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,g2,1,0,0)
end
function c13701002.activate(e,tp,eg,ep,ev,re,r,rp)
	local ex,g1=Duel.GetOperationInfo(0,CATEGORY_TOGRAVE)
	local ex2,g2=Duel.GetOperationInfo(0,CATEGORY_REMOVE)
	local sg=g1:Filter(Card.IsRelateToEffect,nil,e)
	if sg:GetCount()>0 and Duel.SendtoGrave(sg,REASON_EFFECT+REASON_RETURN)~=0 and g2 then
		Duel.Remove(g2,POS_FACEUP,REASON_EFFECT)
	end
end

function c13701002.thcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return c:IsRelateToBattle() and c:GetBattleTarget():IsType(TYPE_MONSTER)
end
function c13701002.filter(c)
	return c:IsRace(RACE_WARRIOR) and c:GetLevel()<=7 and c:IsAbleToHand() and not c:IsType(TYPE_XYZ)
end
function c13701002.thtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c13701002.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13701002.filter,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c13701002.filter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c13701002.thop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end
