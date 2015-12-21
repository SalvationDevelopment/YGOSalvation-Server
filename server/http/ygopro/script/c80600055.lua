--メリアスの木霊
function c80600055.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunctionF(c,aux.FilterBoolFunction(Card.IsAttribute,ATTRIBUTE_EARTH),3),2)
	c:EnableReviveLimit()
	--tograve
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80600055,0))
	e1:SetCategory(CATEGORY_TOGRAVE)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCondition(c80600055.gvcon)
	e1:SetCost(c80600055.cost)
	e1:SetTarget(c80600055.gvtg)
	e1:SetOperation(c80600055.gvop)
	c:RegisterEffect(e1)
	--Special Summon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80600055,1))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c80600055.sscon)
	e2:SetCost(c80600055.cost)
	e2:SetTarget(c80600055.sptg)
	e2:SetOperation(c80600055.spop)
	c:RegisterEffect(e2)
end
function c80600055.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():GetFlagEffect(80600055)==0
		and e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RegisterFlagEffect(80600055,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c80600055.gvcon(e,tp)
	return Duel.IsExistingMatchingCard(c80600055.gvfilter,tp,LOCATION_DECK,0,1,nil)
end
function c80600055.sscon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80600055.ssfilter,tp,LOCATION_GRAVE,0,1,nil,e,tp)
end
function c80600055.gvfilter(c)
	return c:IsRace(RACE_PLANT) and c:IsAbleToGrave()
end
function c80600055.ssfilter(c,e,tp)
	return c:IsRace(RACE_PLANT) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80600055.gvtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80600055.gvfilter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_DECK)
end
function c80600055.gvop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c80600055.gvfilter,tp,LOCATION_DECK,0,1,1,nil)
	local tc=g:GetFirst()
	if tc then
        Duel.SendtoGrave(g:GetFirst(),nil,REASON_EFFECT)
	end
end
function c80600055.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80600055.ssfilter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end	
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c80600055.ssfilter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c80600055.spop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
end
