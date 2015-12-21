--Phoenix Gravitation
function c110000113.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c110000113.condition)
	e1:SetTarget(c110000113.target)
	e1:SetCost(c110000113.cost)
	e1:SetOperation(c110000113.op)
	c:RegisterEffect(e1)
	Duel.AddCustomActivityCounter(110000113,ACTIVITY_SPSUMMON,c110000113.counterfilter)
end

function c110000113.counterfilter(c)
	return c:IsSetCard(0x3A2E)
end

function c110000113.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetCustomActivityCount(110000113,tp,ACTIVITY_SPSUMMON)==0  end
	local e6=Effect.CreateEffect(e:GetHandler())
	e6:SetType(EFFECT_TYPE_FIELD)
	e6:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e6:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e6:SetReset(RESET_PHASE+PHASE_END)
	e6:SetTargetRange(1,0)
	e6:SetTarget(c110000113.sumlimit)
	Duel.RegisterEffect(e6,tp)
end

function c110000113.sumlimit(e,c,sump,sumtype,sumpos,targetp,se)
	return not c:IsSetCard(0x3A2E)
end
function c110000113.cfilter(c)
	return c:IsFaceup() and c:IsCode(110000104)
end
function c110000113.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c110000113.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c110000113.filter(c,e,tp)
	return c:IsSetCard(0x3A2E) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c110000113.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>3
		and Duel.IsExistingMatchingCard(c110000113.filter,tp,LOCATION_GRAVE,0,4,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,4,tp,LOCATION_DECK)
end
function c110000113.op(e,tp,eg,ep,ev,re,r,rp)	
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<4 then return end
	local g=Duel.GetMatchingGroup(c110000113.filter,tp,LOCATION_GRAVE,0,nil,e,tp)
	if g:GetCount()>=4 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local sg=g:Select(tp,4,4,nil)
		Duel.SpecialSummon(sg,0,tp,tp,false,false,POS_FACEUP)
	end
end
	