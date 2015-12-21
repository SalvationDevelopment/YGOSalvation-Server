-- Mirror Force Dragon
function c123124.initial_effect(c)
	c:EnableReviveLimit()
	--spsummon condition
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c123124.splimit)
	c:RegisterEffect(e1)
	--special summon rule
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetCondition(c123124.sprcon)
	e2:SetOperation(c123124.sprop)
	c:RegisterEffect(e2)
	--self destroy
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_SELF_DESTROY)
	e3:SetCondition(c123124.sdcon)
	c:RegisterEffect(e3)
	--search
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(123124,0))
	e4:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e4:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e4:SetCode(EVENT_TO_GRAVE)
	e4:SetCondition(c123124.shcon)
	e4:SetTarget(c123124.shtg)
	e4:SetOperation(c123124.shop)
	c:RegisterEffect(e4)
	--destroy
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(123124,0))
	e5:SetCategory(CATEGORY_DESTROY)
	e5:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e5:SetCode(EVENT_ATTACK_ANNOUNCE)
	e5:SetRange(LOCATION_MZONE)
	e5:SetCondition(c123124.descon)
	e5:SetCost(c123124.descost)
	e5:SetTarget(c123124.destg)
	e5:SetOperation(c123124.desop)
	c:RegisterEffect(e5)	
end
function c123124.splimit(e,se,sp,st)
	return e:GetHandler():GetLocation()~=LOCATION_EXTRA
end
function c123124.sprfilter(c,code)
	return c:IsCode(code) and c:IsAbleToGraveAsCost()
end
function c123124.sprcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.IsExistingMatchingCard(c123124.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,44095762)
		and Duel.IsExistingMatchingCard(c123124.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,12393)
end
function c123124.sprop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g1=Duel.SelectMatchingCard(tp,c123124.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,44095762)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g2=Duel.SelectMatchingCard(tp,c123124.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,12393)
	g1:Merge(g2)
	local tc=g1:GetFirst()
	while tc do
		if not tc:IsFaceup() then Duel.ConfirmCards(1-tp,tc) end
		tc=g1:GetNext()
	end
	Duel.SendtoGrave(g1,nil,2,REASON_COST)
end

function c123124.spfilter1(c,code)
	return c:IsFaceup() and c:IsCode(code)
end

function c123124.vfilter(c)
	return c:IsFaceup() and c:IsCode(123101) or c:IsFaceup() and c:IsCode(123102) or c:IsFaceup() and c:IsCode(123103)
end

function c123124.sdcon(e)
	local c=e:GetHandler()
	return Duel.IsExistingMatchingCard(c123124.vfilter,c:GetControler(),LOCATION_SZONE,0,1,c)
end

function c123124.shcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsReason(REASON_DESTROY) and e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end

function c123124.filter(c,e,tp)
	return c:IsCode(44095762) and c:IsAbleToHand()
end
function c123124.shtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c123124.filter,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_GRAVE)
end
function c123124.shop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)==0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c123124.filter,tp,LOCATION_GRAVE,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end

function c123124.descon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()~=tp
end
function c123124.descost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsReleasable() end
	Duel.Release(e:GetHandler(),REASON_COST)
end
function c123124.dfilter(c)
	return  c:IsAttackPos()  and c:IsDestructable()
end
function c123124.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c123124.dfilter,tp,0,LOCATION_MZONE,1,nil) end
	local g=Duel.GetMatchingGroup(c123124.dfilter,tp,0,LOCATION_MZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,0)
end
function c123124.desop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c123124.dfilter,tp,0,LOCATION_MZONE,nil)
	Duel.Destroy(g,REASON_EFFECT)
	local dg=Duel.GetOperatedGroup()
	local tc=dg:GetFirst()
	local dam=0
	while tc do
		local atk=tc:GetTextAttack()
		if atk<0 then atk=0 end
		dam=dam+atk
		tc=dg:GetNext()
	end
	Duel.Damage(1-tp,dam,REASON_EFFECT)
end
