--Big Volcano
function c12348.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DAMAGE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c12348.cost)
	e1:SetTarget(c12348.target)
	e1:SetOperation(c12348.activate)
	c:RegisterEffect(e1)
end

function c12348.costfilter(c)
	return c:IsType(TYPE_MONSTER) and c:IsRace(RACE_PYRO) and c:IsDiscardable()
end
function c12348.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c12348.costfilter,tp,LOCATION_HAND,0,1,e:GetHandler()) end
	Duel.DiscardHand(tp,c12348.costfilter,1,1,REASON_COST+REASON_DISCARD)
end

function c12348.filter(c,e,tp)
	return c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c12348.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetControler()==tp and chkc:GetLocation()~=LOCATION_GRAVE and c12348.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>1
		and Duel.IsExistingTarget(c12348.filter,tp,0,LOCATION_GRAVE,2,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c12348.filter,tp,0,LOCATION_GRAVE,2,2,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,g:GetCount(),0,0)
end
function c12348.activate(e,tp,eg,ep,ev,re,r,rp)
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	if ft<=0 then return end
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local fg=g:Filter(Card.IsRelateToEffect,nil,e)
	if fg:GetCount()>1 and ft==1 then fg=fg:Select(tp,1,1,nil) end
	local tc=fg:GetFirst()
	while tc do
		Duel.SpecialSummonStep(tc,0,tp,1-tp,false,false,POS_FACEUP)
		tc=fg:GetNext()
	end
	Duel.SpecialSummonComplete()
end
