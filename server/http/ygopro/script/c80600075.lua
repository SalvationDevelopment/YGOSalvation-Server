--ヴァンパイア・シフト
function c80600075.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80600075.condition)
	e1:SetCost(c80600075.cost)
	e1:SetTarget(c80600075.target)
	e1:SetOperation(c80600075.activate)
	c:RegisterEffect(e1)
end

function c80600075.confilter(c)
	return c:IsFaceup() and not c:IsRace(RACE_ZOMBIE)
end
function c80600075.confilter2(c)
	return c:IsFaceup() and c:IsRace(RACE_ZOMBIE)
end

function c80600075.condition(e,tp,eg,ep,ev,re,r,rp)
	return not Duel.GetFieldCard(tp,LOCATION_SZONE,5) and 
	not Duel.IsExistingMatchingCard(c80600075.confilter,tp,LOCATION_MZONE,0,1,nil)
	and Duel.IsExistingMatchingCard(c80600075.confilter2,tp,LOCATION_MZONE,0,1,nil)
end
function c80600075.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80600075)==0 end
	Duel.RegisterFlagEffect(tp,80600075,RESET_PHASE+PHASE_END,0,1)
end

function c80600075.filter(c,tp)
	return c:IsCode(80600064) and c:GetActivateEffect():IsActivatable(tp)
end
function c80600075.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80600075.filter,tp,LOCATION_DECK,0,1,nil,tp) end
end

function c80600075.spfilter(c,atk,e,tp)
	return  c:IsSetCard(0x92) and 
	c:IsAttribute(ATTRIBUTE_DARK) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end

function c80600075.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstMatchingCard(c80600075.filter,tp,LOCATION_DECK,0,nil,tp)
	if tc then
		if Duel.GetFieldCard(1-tp,LOCATION_SZONE,5)~=nil
			and Duel.GetFieldCard(1-tp,LOCATION_SZONE,5):IsFaceup() then
			Duel.MoveToField(tc,tp,tp,LOCATION_SZONE,POS_FACEUP,true)
			Duel.Destroy(Duel.GetFieldCard(1-tp,LOCATION_SZONE,5),REASON_RULE)
		else
			Duel.MoveToField(tc,tp,tp,LOCATION_SZONE,POS_FACEUP,true)
		end
		Duel.RaiseEvent(tc,EVENT_CHAIN_SOLVED,tc:GetActivateEffect(),0,tp,tp,Duel.GetCurrentChain())
	end
	local sg=Duel.GetMatchingGroup(c80600075.spfilter,tp,LOCATION_GRAVE,0,nil,atk,e,tp)
	if sg:GetCount()>0 and Duel.SelectYesNo(tp,aux.Stringid(80600075,0)) then
		Duel.BreakEffect()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local dg=sg:Select(tp,1,1,nil)
		Duel.SpecialSummon(dg,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
end