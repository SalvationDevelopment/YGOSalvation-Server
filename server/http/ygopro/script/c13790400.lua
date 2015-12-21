--Lose A Turn
function c13790400.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_SUMMON+TIMING_SPSUMMON)
	e1:SetCondition(c13790400.condition)
	e1:SetTarget(c13790400.target1)
	e1:SetOperation(c13790400.operation)
	c:RegisterEffect(e1)
	--pos
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(54059040,0))
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	e2:SetRange(LOCATION_SZONE)
	e2:SetOperation(c13790400.negop)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(54059040,0))
	e3:SetCategory(CATEGORY_POSITION)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	e3:SetRange(LOCATION_SZONE)
	e3:SetTarget(c13790400.target2)
	e3:SetOperation(c13790400.operation)
	e3:SetLabel(1)
	c:RegisterEffect(e3)
end
function c13790400.ssfilter(c)
	return bit.band(c:GetSummonType(),SUMMON_TYPE_SPECIAL)==SUMMON_TYPE_SPECIAL
end
function c13790400.condition(e,tp,eg,ep,ev,re,r,rp)
	return not Duel.IsExistingMatchingCard(c13790400.ssfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c13790400.cfilter(c)
	return c:IsFaceup() and c:IsAttribute(ATTRIBUTE_WATER)
end
function c13790400.pfilter(c,e)
	return c:IsPosition(POS_FACEUP_ATTACK) and c:IsType(TYPE_EFFECT) and (not e or c:IsRelateToEffect(e))
end
function c13790400.target1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local res,teg,tep,tev,tre,tr,trp=Duel.CheckEvent(EVENT_SUMMON_SUCCESS,true)
	if not res then
		res,teg,tep,tev,tre,tr,trp=Duel.CheckEvent(EVENT_SPSUMMON_SUCCESS,true)
	end
	if res and Duel.IsExistingMatchingCard(c13790400.cfilter,tp,LOCATION_MZONE,0,1,nil)
		and teg:IsExists(c13790400.pfilter,1,nil)
		and Duel.SelectYesNo(tp,aux.Stringid(54059040,1)) then
		e:SetLabel(1)
		Duel.SetTargetCard(teg)
		Duel.SetOperationInfo(0,CATEGORY_POSITION,teg,teg:GetCount(),0,0)
	else
		e:SetLabel(0)
	end
end
function c13790400.target2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsRelateToEffect(e)
		and Duel.IsExistingMatchingCard(c13790400.cfilter,tp,LOCATION_MZONE,0,1,nil)
		and eg:IsExists(c13790400.pfilter,1,nil) end
	Duel.SetTargetCard(eg)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,eg,eg:GetCount(),0,0)
end
function c13790400.operation(e,tp,eg,ep,ev,re,r,rp)
	if e:GetLabel()==0 or not e:GetHandler():IsRelateToEffect(e) then return end
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(c13790400.pfilter,nil,e)
	Duel.ChangePosition(g,POS_FACEUP_DEFENCE)
end

function c13790400.negfilter(c,e,tp)
	return c:IsType(TYPE_EFFECT)
end
function c13790400.negop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local g=eg:Filter(c13790400.negfilter,nil,e,tp)
	local tc=g:GetFirst()
	while tc do
		Duel.NegateRelatedChain(tc,RESET_TURN_SET)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_DISABLE)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		tc:RegisterEffect(e1)
		local e2=Effect.CreateEffect(e:GetHandler())
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_DISABLE_EFFECT)
		e2:SetValue(RESET_TURN_SET)
		e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		tc:RegisterEffect(e2)
		tc=g:GetNext()
	end
end
