--Ancient Key
function c12331.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCondition(c12331.condition)
	e1:SetOperation(c12331.operation)
	c:RegisterEffect(e1)
	--Add
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetDescription(aux.Stringid(12331,1))
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCost(c12331.cost)
	e2:SetTarget(c12331.target)
	e2:SetOperation(c12331.operation2)
	c:RegisterEffect(e2)	
end

function c12331.costfilter(c)
	return c:IsPosition(POS_FACEUP_ATTACK) and c:IsCode(12334)
end
function c12331.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,c12331.costfilter,2,nil) end
	local g=Duel.SelectReleaseGroup(tp,c12331.costfilter,2,2,nil)
	Duel.Release(g,REASON_COST)
end

function c12331.filter1(c)
	return c:IsCode(12332) and c:IsAbleToHand() 
end
function c12331.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c12331.filter1,tp,LOCATION_DECK+LOCATION_GRAVE,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK+LOCATION_GRAVE)
end
function c12331.operation2(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c12331.filter1,tp,LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end

function c12331.condition(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()
	 and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
	 and Duel.IsExistingMatchingCard(c12331.filter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,nil,e,tp)
	 and Duel.IsExistingMatchingCard(c12331.zfilter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,nil,e,tp)
	 and Duel.IsExistingMatchingCard(c12331.cfilter,tp,LOCATION_ONFIELD,0,1,nil)
end

function c12331.filter(c,e,tp)
	return c:IsCode(12334) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c12331.zfilter(c,e,tp)
	return c:IsCode(12334) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c12331.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)==0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g1=Duel.SelectMatchingCard(tp,c12331.zfilter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,1,nil,e,tp)
	if g1:GetCount()>0 then Duel.SpecialSummonStep(g1:GetFirst(),0,tp,tp,true,true,POS_FACEUP_DEFENCE) end
	local g2=Duel.SelectMatchingCard(tp,c12331.filter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,1,nil,e,tp)
	if g2:GetCount()>0 then Duel.SpecialSummonStep(g2:GetFirst(),0,tp,tp,true,true,POS_FACEUP_DEFENCE) end
	Duel.SpecialSummonComplete()
end
function c12331.cfilter(c)
	return c:IsFaceup() and c:IsCode(12329)
end