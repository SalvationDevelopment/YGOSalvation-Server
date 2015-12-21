--Chaos Emperor Dragon - Envoy of the End (Errata)
function c823019041.initial_effect(c)
	c:EnableReviveLimit()
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c823019041.spcon)
	e1:SetOperation(c823019041.spop)
	c:RegisterEffect(e1)
	--to grave
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TOGRAVE+CATEGORY_DAMAGE)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCost(c823019041.sgcost)
	e2:SetTarget(c823019041.sgtg)
	e2:SetOperation(c823019041.sgop)
	c:RegisterEffect(e2)
	if not c823019041.global_check then
		c823019041.global_check=true
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_CHAIN_SOLVED)
		ge1:SetOperation(c823019041.checkop)
		Duel.RegisterEffect(ge1,0)
	end
end
function c823019041.spfilter(c,att)
	return c:IsAttribute(att) and c:IsAbleToRemoveAsCost()
end
function c823019041.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c823019041.spfilter,tp,LOCATION_GRAVE,0,1,nil,ATTRIBUTE_LIGHT)
		and Duel.IsExistingMatchingCard(c823019041.spfilter,tp,LOCATION_GRAVE,0,1,nil,ATTRIBUTE_DARK)
end
function c823019041.spop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g1=Duel.SelectMatchingCard(tp,c823019041.spfilter,tp,LOCATION_GRAVE,0,1,1,nil,ATTRIBUTE_LIGHT)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g2=Duel.SelectMatchingCard(tp,c823019041.spfilter,tp,LOCATION_GRAVE,0,1,1,nil,ATTRIBUTE_DARK)
	g1:Merge(g2)
	Duel.Remove(g1,POS_FACEUP,REASON_COST)
end
function c823019041.sgcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,823019041)==0 and Duel.CheckLPCost(tp,1000)
	else Duel.PayLPCost(tp,1000) end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EFFECT_CANNOT_ACTIVATE)
	e1:SetTargetRange(1,0)
	e1:SetValue(c823019041.aclimit)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end
function c823019041.sgtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local g=Duel.GetFieldGroup(tp,0,0xe)
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,g,g:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,0,0,1-tp,g:GetCount()*300)
end
function c823019041.sgop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetFieldGroup(tp,0,0xe)
	Duel.SendtoGrave(g,REASON_EFFECT)
	local og=Duel.GetOperatedGroup()
	local ct=og:FilterCount(Card.IsLocation,nil,LOCATION_GRAVE)
	local g=Duel.GetFieldGroup(tp,0xe,0)
	Duel.SendtoGrave(g,REASON_EFFECT)
	Duel.BreakEffect()
	Duel.Damage(1-tp,ct*300,REASON_EFFECT)
end
function c823019041.aclimit(e,re,tp)
	return not re:GetHandler():IsCode(823019041)
end
function c823019041.checkop(e,tp,eg,ep,ev,re,r,rp)
	if not re:GetHandler():IsCode(823019041) then
		Duel.RegisterFlagEffect(rp,823019041,RESET_PHASE+PHASE_END,0,1)
	end
end
