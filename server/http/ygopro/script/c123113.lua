--Magician's Selection
function c123113.initial_effect(c)
	--Effect 1
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(TIMING_DRAW_PHASE+TIMING_SUMMON+TIMING_SPSUMMON+TIMING_FLIPSUMMON)
	e1:SetCost(c123113.cost)
	e1:SetCondition(c123113.condition)	
	e1:SetTarget(c123113.target)
	e1:SetOperation(c123113.activate)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCondition(c123113.condition)	
	e2:SetCost(c123113.cost2)
	e2:SetTarget(c123113.target2)
	e2:SetOperation(c123113.activate)
	c:RegisterEffect(e2)
end

function c123113.condition(e)
	return Duel.GetFieldGroupCount(e:GetHandlerPlayer(),LOCATION_MZONE,0)==1
end

function c123113.costfilter(c)
	return c:IsFaceup() and c:IsType(TYPE_NORMAL) and c:IsRace(RACE_SPELLCASTER) and c:IsAbleToGraveAsCost()
end

function c123113.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c123113.costfilter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c123113.costfilter,tp,LOCATION_MZONE,0,1,1,nil)
	Duel.SendtoGrave(g,REASON_COST)
end

function c123113.filter(c,e,tp)
	return c:IsRace(RACE_SPELLCASTER) and c:IsType(TYPE_EFFECT) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end

function c123113.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chkc then return ep~=tp and chkc:GetLocation()==LOCATION_HAND+LOCATION_DECK and chkc:GetControler()==tp
		and chkc:IsCanBeSpecialSummoned(e,0,tp,false,false) end
	if chk==0 then return ep~=tp and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c123113.filter,tp,LOCATION_HAND+LOCATION_DECK,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c123113.filter,tp,LOCATION_HAND+LOCATION_DECK,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end

function c123113.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end

function c123113.costfilter2(c)
	return c:IsFaceup() and c:IsType(TYPE_EFFECT) and c:IsRace(RACE_SPELLCASTER) and c:IsAbleToGraveAsCost()
end

function c123113.cost2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c123113.costfilter2,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c123113.costfilter2,tp,LOCATION_MZONE,0,1,1,nil)
	Duel.SendtoGrave(g,REASON_COST)
end

function c123113.filter2(c,e,tp)
	return c:IsRace(RACE_SPELLCASTER) and c:IsType(TYPE_NORMAL) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end

function c123113.target2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chkc then return chkc:GetLocation()==LOCATION_HAND+LOCATION_DECK and chkc:GetControler()==tp
		and chkc:IsCanBeSpecialSummoned(e,0,tp,false,false) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c123113.filter2,tp,LOCATION_HAND+LOCATION_DECK,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c123113.filter2,tp,LOCATION_HAND+LOCATION_DECK,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
