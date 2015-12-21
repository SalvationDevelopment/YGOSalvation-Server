--Ritual of the Sibylla
function c13720036.initial_effect(c)
	aux.AddRitualProcGreater(c,aux.FilterBoolFunction(Card.IsCode,13720035))
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(13790594,1))
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCondition(c13720036.descon)
	e2:SetCost(c13720036.descost)
	e2:SetTarget(c13720036.destg)
	e2:SetOperation(c13720036.activate)
	c:RegisterEffect(e2)
end
function c13720036.descon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnCount()~=e:GetHandler():GetTurnID()
end
function c13720036.descost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c13720036.filter(c)
	return c:IsSetCard(0x1374) and c:IsType(TYPE_MONSTER) and c:IsAbleToHand()
end
function c13720036.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13720036.filter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c13720036.activate(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c13720036.filter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end


