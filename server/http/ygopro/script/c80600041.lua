--剛地帝グランマーグ
function c80600041.initial_effect(c)
	--normal summon with 1 tribute
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80600041,0))
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SUMMON_PROC)
	e1:SetCondition(c80600041.otcon)
	e1:SetOperation(c80600041.otop)
	e1:SetValue(SUMMON_TYPE_ADVANCE)
	c:RegisterEffect(e1)
	--destroy
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCode(EVENT_SUMMON_SUCCESS)
	e2:SetCondition(c80600041.descon)
	e2:SetTarget(c80600041.destar)
	e2:SetOperation(c80600041.desop)
	c:RegisterEffect(e2)
	--draw
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_DRAW)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetCode(EVENT_SUMMON_SUCCESS)
	e3:SetCondition(c80600041.drawcon)
	e3:SetOperation(c80600041.drawop)
	c:RegisterEffect(e3)
end
function c80600041.otcon(e,c)
	if c==nil then return true end
	local g=Duel.GetTributeGroup(c)
	return g:IsExists(c80600041.filter,1,nil)
end
function c80600041.otop(e,tp,eg,ep,ev,re,r,rp,c)
	local g=Duel.GetTributeGroup(c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RELEASE)
	local sg=g:FilterSelect(tp,c80600041.filter,1,1,nil)
	c:SetMaterial(sg)
	Duel.Release(sg, REASON_SUMMON+REASON_MATERIAL)
end
function c80600041.filter(c)
	return c:GetSummonType()==SUMMON_TYPE_ADVANCE
end
function c80600041.drawcon(e,tp,eg,ep,ev,re,r,rp)
	local g=e:GetHandler():GetMaterial()
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_ADVANCE and g:IsExists(Card.IsAttribute,1,nil,ATTRIBUTE_EARTH)
end
function c80600041.descon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_ADVANCE
end
function c80600041.desfilter(c)
	return c:IsFacedown() and c:IsDestructable()
end
function c80600041.destar(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and c80600041.desfilter(chkc) end
	if chk==0 then return true end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c80600041.desfilter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,2,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c80600041.desop(e,tp,eg,ep,ev,re,r,rp)
	local tg=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local sg=tg:Filter(Card.IsRelateToEffect,nil,e)
	Duel.Destroy(sg,REASON_EFFECT)
end
function c80600041.drawop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Draw(tp,1,REASON_EFFECT)
end
