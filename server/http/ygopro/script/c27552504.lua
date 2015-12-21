--Beatrice, the Eternal Lady
function c27552504.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,6,2,c27552504.ovfilter,aux.Stringid(27552504,0),2,c27552504.xyzop)
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(27552504,2))
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCost(c27552504.cost)
	e1:SetTarget(c27552504.target)
	e1:SetOperation(c27552504.operation)
	c:RegisterEffect(e1)
	--spsummon2
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(27552504,2))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetCondition(c27552504.spcon)
	e3:SetTarget(c27552504.sptg)
	e3:SetOperation(c27552504.spop)
	c:RegisterEffect(e3)
end
function c27552504.cfilter(c)
	return c:IsSetCard(0xb1) and c:IsType(TYPE_MONSTER) and c:IsDiscardable()
end
function c27552504.ovfilter(c)
	return c:IsFaceup() and (c:IsCode(18386170) or c:IsCode(83531441))
end
function c27552504.xyzop(e,tp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c27552504.cfilter,tp,LOCATION_HAND,0,1,nil) end
	Duel.DiscardHand(tp,c27552504.cfilter,1,1,REASON_COST+REASON_DISCARD)
	e:GetHandler():RegisterFlagEffect(27552504,RESET_EVENT+0xfe0000+RESET_PHASE+PHASE_END,0,1)
end

function c27552504.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c27552504.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():GetFlagEffect(27552504)==0
		and Duel.IsExistingMatchingCard(Card.IsAbleToGrave,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,0,1,tp,LOCATION_DECK)
end
function c27552504.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,Card.IsAbleToGrave,tp,LOCATION_DECK,0,1,1,nil)
	Duel.SendtoGrave(g,REASON_EFFECT)
end

function c27552504.spcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return c:GetPreviousControler()==tp and c:IsReason(REASON_DESTROY) and rp~=tp
end
function c27552504.spfilter(c,e,tp)
	return c:IsSetCard(0xb1) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c27552504.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c27552504.spfilter,tp,LOCATION_EXTRA,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c27552504.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c27552504.spfilter,tp,LOCATION_EXTRA,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,true,true,POS_FACEUP)
	end
end
