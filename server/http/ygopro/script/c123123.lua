-- Doom Virus Dragon
function c123123.initial_effect(c)
	c:EnableReviveLimit()
	--spsummon condition
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c123123.splimit)
	c:RegisterEffect(e1)
	--special summon rule
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetCondition(c123123.sprcon)
	e2:SetOperation(c123123.sprop)
	c:RegisterEffect(e2)
	--self destroy
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_SELF_DESTROY)
	e3:SetCondition(c123123.sdcon)
	c:RegisterEffect(e3)
	--search
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(123123,0))
	e4:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e4:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e4:SetCode(EVENT_TO_GRAVE)
	e4:SetCondition(c123123.shcon)
	e4:SetTarget(c123123.shtg)
	e4:SetOperation(c123123.shop)
	c:RegisterEffect(e4)
	--destroy
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(123123,0))
	e5:SetCategory(CATEGORY_DESTROY)
	e5:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e5:SetCode(EVENT_SUMMON_SUCCESS)
	e5:SetRange(LOCATION_MZONE)
	e5:SetTarget(c123123.target)
	e5:SetOperation(c123123.activate)
	c:RegisterEffect(e5)
	local e6=e5:Clone()
	e6:SetCode(EVENT_SPSUMMON_SUCCESS)
	c:RegisterEffect(e6)
	local e7=e6:Clone()
	e7:SetCode(EVENT_ADJUST)
	c:RegisterEffect(e7)
	local e8=e7:Clone()
	e4:SetCode(EVENT_PRE_BATTLE_DAMAGE)
	c:RegisterEffect(e8)
	local e9=e8:Clone()
	e9:SetCode(EVENT_FLIP)
	c:RegisterEffect(e9)	
end
c123123.material_count=2
c123123.material={35027493,12393}
function c123123.splimit(e,se,sp,st)
	return e:GetHandler():GetLocation()~=LOCATION_EXTRA
end
function c123123.sprfilter(c,code)
	return c:IsCode(code) and c:IsAbleToGraveAsCost()
end
function c123123.sprcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.IsExistingMatchingCard(c123123.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,35027493)
		and Duel.IsExistingMatchingCard(c123123.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,12393)
end
function c123123.sprop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g1=Duel.SelectMatchingCard(tp,c123123.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,35027493)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g2=Duel.SelectMatchingCard(tp,c123123.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,12393)
	g1:Merge(g2)
	local tc=g1:GetFirst()
	while tc do
		if not tc:IsFaceup() then Duel.ConfirmCards(1-tp,tc) end
		tc=g1:GetNext()
	end
	Duel.SendtoGrave(g1,nil,2,REASON_COST)
end

function c123123.spfilter1(c,code)
	return c:IsFaceup() and c:IsCode(code)
end

function c123123.vfilter(c)
	return c:IsFaceup() and c:IsCode(123101) or c:IsFaceup() and c:IsCode(123102) or c:IsFaceup() and c:IsCode(123103)
end

function c123123.sdcon(e)
	local c=e:GetHandler()
	return Duel.IsExistingMatchingCard(c123123.vfilter,c:GetControler(),LOCATION_SZONE,0,1,c)
end

function c123123.shcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsReason(REASON_DESTROY) and e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end

function c123123.jfilter(c,e,tp)
		local code=c:GetCode()
	return c:IsCode(35027493) and c:IsAbleToHand()
end
function c123123.shtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c123123.jfilter,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_GRAVE)
end
function c123123.shop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)==0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c123123.jfilter,tp,LOCATION_GRAVE,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end

function c123123.tgfilter(c)
	return c:IsFaceup() and c:GetAttack()>=1500 and c:IsDestructable()
end
function c123123.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local g=Duel.GetMatchingGroup(c123123.tgfilter,tp,0,LOCATION_MZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c123123.filter(c)
	return c:IsFaceup() and c:IsType(TYPE_MONSTER) and c:IsAttackAbove(1500)
end
function c123123.activate(e,tp,eg,ep,ev,re,r,rp)
	local conf=Duel.GetFieldGroup(tp,0,LOCATION_MZONE)
		local dg=conf:Filter(c123123.filter,nil)
		Duel.Destroy(dg,REASON_EFFECT)
end
