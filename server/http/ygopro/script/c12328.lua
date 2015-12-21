--Toon Briefcase
function c12328.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DISABLE_SUMMON+CATEGORY_TODECK)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetCondition(c12328.condition)
	e1:SetTarget(c12328.target)
	e1:SetOperation(c12328.activate)
	c:RegisterEffect(e1)
end
function c12328.cfilter(c)
	return c:IsFaceup() and c:IsCode(15259703)
end
function c12328.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c12328.cfilter,tp,LOCATION_ONFIELD,0,1,nil)
end
function c12328.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_DISABLE_SUMMON,eg,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,eg,1,0,0)
end
function c12328.activate(e,tp,eg,ep,ev,re,r,rp,chk)
	Duel.SendtoDeck(eg,nil,2,REASON_EFFECT)
end
