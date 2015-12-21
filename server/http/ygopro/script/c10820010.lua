--GAIAPELIO
function c10820010.initial_effect(c)
	--fusion material
	c:EnableReviveLimit()
	aux.AddFusionProcFun2(c,aux.FilterBoolFunction(Card.IsSetCard,0x40b5),aux.FilterBoolFunction(Card.IsSetCard,0x20b5),aux.FilterBoolFunction(Card.IsSetCard,0x10b5),true,true)
	--spsummon condition
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	c:RegisterEffect(e1)
	--special summon rule
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetCondition(c10820010.sprcon)
	e2:SetOperation(c10820010.sprop)
	c:RegisterEffect(e2)
	--Negate
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(10820010,0))
	e3:SetCategory(CATEGORY_NEGATE+CATEGORY_DESTROY)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_QUICK_O)
	e3:SetCode(EVENT_CHAINING)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DAMAGE_CAL)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c10820010.discon)
	e3:SetCost(c10820010.discost)
	e3:SetTarget(c10820010.distg)
	e3:SetOperation(c10820010.disop)
	c:RegisterEffect(e3)
	
end
function c10820010.spfilter1(c,tp)
	return c:IsSetCard(0x20b5) and c:IsAbleToRemoveAsCost() and c:IsCanBeFusionMaterial()
		and Duel.IsExistingMatchingCard(c10820010.spfilter2,tp,LOCATION_MZONE,0,1,c)
end
function c10820010.spfilter2(c,tp)
	return c:IsSetCard(0x40b5) and c:IsAbleToRemoveAsCost() and c:IsCanBeFusionMaterial()
		and Duel.IsExistingMatchingCard(c10820010.spfilter3,tp,LOCATION_MZONE,0,1,c)
end
function c10820010.spfilter3(c)
	return c:IsSetCard(0x10b5) and c:IsAbleToRemoveAsCost() and c:IsCanBeFusionMaterial()
end
function c10820010.sprcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>-3
		and Duel.IsExistingMatchingCard(c10820010.spfilter1,tp,LOCATION_MZONE,0,1,nil,tp)
end
function c10820010.sprop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g1=Duel.SelectMatchingCard(tp,c10820010.spfilter1,tp,LOCATION_MZONE,0,1,1,nil,tp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g2=Duel.SelectMatchingCard(tp,c10820010.spfilter2,tp,LOCATION_MZONE,0,1,1,g1:GetFirst())
	g1:Merge(g2)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g3=Duel.SelectMatchingCard(tp,c10820010.spfilter3,tp,LOCATION_MZONE,0,1,1,g1:GetFirst())
	g1:Merge(g3)
	Duel.Remove(g1,POS_FACEUP,REASON_COST)
end

function c10820010.discon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if ep==tp or c:IsStatus(STATUS_BATTLE_DESTROYED) then return false end
	return (re:IsActiveType(TYPE_MONSTER) or re:IsHasType(EFFECT_TYPE_ACTIVATE)) and Duel.IsChainNegatable(ev)
end
function c10820010.costfilter(c)
	return c:IsSetCard(0xb5) and c:IsAbleToRemoveAsCost()
end
function c10820010.discost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c10820010.costfilter,tp,LOCATION_HAND,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c10820010.costfilter,tp,LOCATION_HAND,0,1,1,nil)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c10820010.distg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,eg,1,0,0)
	if re:GetHandler():IsDestructable() and re:GetHandler():IsRelateToEffect(re) then
		Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,1,0,0)
	end
end
function c10820010.disop(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateActivation(ev)
	if re:GetHandler():IsRelateToEffect(re) then
		Duel.Destroy(eg,REASON_EFFECT)
	end
end
